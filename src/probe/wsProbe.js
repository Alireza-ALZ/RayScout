const net = require("net");
const tls = require("tls");

function buildWebSocketRequest(config) {
  const path = config.path || "/";
  const host = config.sni || config.address;

  return [
    `GET ${path} HTTP/1.1`,
    `Host: ${host}`,
    "Upgrade: websocket",
    "Connection: Upgrade",
    "Sec-WebSocket-Version: 13",
    "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==",
    "User-Agent: RayScout-WS-Probe",
    "\r\n",
  ].join("\r\n");
}

function parseWebSocketResponse(data) {
  const response = data.toString("utf8");
  const statusLine = response.split("\r\n")[0] || "";
  const statusMatch = statusLine.match(/HTTP\/1\.1\s+(\d{3})/);

  if (!statusMatch) {
    return { success: false, reason: "invalid_http_response", error: response };
  }

  const statusCode = Number(statusMatch[1]);
  if (statusCode !== 101) {
    return {
      success: false,
      reason: "websocket_upgrade_failed",
      error: response,
    };
  }

  return { success: true, reason: "websocket_path_ok" };
}

async function probeWebSocket(config, timeout) {
  const start = Date.now();
  const isTls = String(config.security || "").toLowerCase() === "tls";
  const options = {
    host: config.address,
    port: config.port,
    servername: config.sni || config.address,
    rejectUnauthorized: false,
  };

  return new Promise((resolve) => {
    const socket = isTls ? tls.connect(options) : new net.Socket();

    const cleanup = () => {
      if (socket.destroyed === false) {
        socket.destroy();
      }
    };

    const timeoutHandle = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        reason: "ws_timeout",
        error: `WebSocket timed out after ${timeout}ms`,
        latency: timeout,
      });
    }, timeout);

    const onConnect = () => {
      socket.write(buildWebSocketRequest(config));
    };

    socket.once("connect", onConnect);
    socket.once("secureConnect", onConnect);

    socket.once("data", (data) => {
      clearTimeout(timeoutHandle);
      const latency = Date.now() - start;
      const result = parseWebSocketResponse(data);
      cleanup();
      resolve({
        success: result.success,
        reason: result.reason,
        error: result.error || null,
        latency,
      });
    });

    socket.once("error", (error) => {
      clearTimeout(timeoutHandle);
      cleanup();
      resolve({
        success: false,
        reason: "ws_connection_failed",
        error: error.message,
        latency: Date.now() - start,
      });
    });

    if (!isTls) {
      socket.connect(config.port, config.address);
    }
  });
}

module.exports = { probeWebSocket };

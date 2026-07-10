const { expect } = require("chai");
const net = require("net");
const { probeWebSocket } = require("../../../src/probe/wsProbe");

describe("WebSocket Probe Test", () => {
  let server;
  let port;

  before((done) => {
    server = net.createServer((socket) => {
      socket.once("data", () => {
        socket.write(
          "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: dummy==\r\n\r\n",
        );
      });
    });

    server.listen(0, "127.0.0.1", () => {
      port = server.address().port;
      done();
    });
  });

  after((done) => {
    server.close(done);
  });

  it("validates a websocket path successfully", async () => {
    const result = await probeWebSocket(
      {
        address: "127.0.0.1",
        port,
        path: "/test",
        security: "none",
      },
      1000,
    );

    expect(result.success).to.equal(true);
    expect(result.reason).to.equal("websocket_path_ok");
  });

  it("fails websocket validation for bad path response", async () => {
    const failingServer = net.createServer((socket) => {
      socket.once("data", () => {
        socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      });
    });

    await new Promise((resolve) =>
      failingServer.listen(0, "127.0.0.1", resolve),
    );
    const badPort = failingServer.address().port;

    const result = await probeWebSocket(
      {
        address: "127.0.0.1",
        port: badPort,
        path: "/invalid",
        security: "none",
      },
      1000,
    );

    expect(result.success).to.equal(false);
    expect(result.reason).to.equal("websocket_upgrade_failed");

    await new Promise((resolve) => failingServer.close(resolve));
  });
});

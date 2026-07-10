const dns = require("dns");
const net = require("net");
const tls = require("tls");
const { probeWebSocket } = require("./wsProbe");

class ProbeEngine {
  constructor(options = {}) {
    this.timeout = options.timeout || 3000;
    this.retries = options.retries || 1;
  }

  async probeConfig(config) {
    if (!config || !config.address || !config.port) {
      return this.#buildResult({
        config,
        success: false,
        status: "invalid",
        reason: "missing_address_or_port",
      });
    }

    try {
      const dnsResult = await this.#resolveDns(config.address);
      if (!dnsResult.success) {
        return this.#buildResult({
          config,
          success: false,
          status: "invalid",
          reason: "dns_resolution_failed",
          error: dnsResult.error,
        });
      }

      const attempts = [];
      for (let attempt = 0; attempt < this.retries; attempt += 1) {
        if (String(config.network || "").toLowerCase() === "ws") {
          attempts.push(this.#probeWs(config));
        } else if (String(config.security || "").toLowerCase() === "tls") {
          attempts.push(this.#probeTls(config));
        } else {
          attempts.push(this.#probeTcp(config));
        }
      }

      const results = await Promise.all(attempts);
      const success = results.some((result) => result.success);

      if (success) {
        return this.#buildResult({
          config,
          success: true,
          status: "available",
          reason: results.find((r) => r.success).reason || "connected",
          latency: this.#minLatency(results),
        });
      }

      const lastFailure =
        results[results.length - 1] ||
        this.#buildResult({
          config,
          success: false,
          status: "unavailable",
          reason: "tcp_connection_failed",
        });

      return this.#buildResult({
        config,
        success: false,
        status: "unavailable",
        reason: lastFailure.reason,
        error: lastFailure.error,
      });
    } catch (error) {
      return this.#buildResult({
        config,
        success: false,
        status: "unavailable",
        reason: "probe_error",
        error: error.message,
      });
    }
  }

  async probeConfigs(configs = []) {
    if (!Array.isArray(configs)) {
      throw new Error("configs must be an array");
    }

    const results = await Promise.all(
      configs.map((config) => this.probeConfig(config)),
    );

    return results.map((result, index) => ({
      ...result,
      index,
      summary: this.#summarizeResult(result),
    }));
  }

  async #probeTcp(config) {
    const start = Date.now();

    return new Promise((resolve) => {
      const socket = new net.Socket();

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({
          success: false,
          reason: "timeout",
          error: `Timed out after ${this.timeout}ms`,
          latency: this.timeout,
        });
      }, this.timeout);

      socket.once("connect", () => {
        clearTimeout(timeout);
        socket.end();
        resolve({
          success: true,
          reason: "tcp_connected",
          latency: Date.now() - start,
        });
      });

      socket.once("error", (error) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          reason: "tcp_connection_failed",
          error: error.message,
          latency: Date.now() - start,
        });
      });

      socket.connect(config.port, config.address);
    });
  }

  async #resolveDns(address) {
    return new Promise((resolve) => {
      dns.lookup(address, (error) => {
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }

        resolve({ success: true });
      });
    });
  }

  async #probeWs(config) {
    return probeWebSocket(config, this.timeout);
  }

  async #probeTls(config) {
    const start = Date.now();

    return new Promise((resolve) => {
      const options = {
        host: config.address,
        port: config.port,
        servername: config.sni || config.address,
        rejectUnauthorized: false,
      };

      const socket = tls.connect(options, () => {
        const latency = Date.now() - start;
        socket.end();
        resolve({ success: true, reason: "tls_handshake_ok", latency });
      });

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({
          success: false,
          reason: "tls_timeout",
          error: `TLS timed out after ${this.timeout}ms`,
          latency: this.timeout,
        });
      }, this.timeout);

      socket.once("error", (err) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          reason: "tls_handshake_failed",
          error: err.message,
          latency: Date.now() - start,
        });
      });
    });
  }

  #buildResult({ config, success, status, reason, latency, error }) {
    return {
      configId: config?.id || null,
      protocol: config?.protocol || null,
      address: config?.address || null,
      port: config?.port || null,
      success,
      status,
      reason,
      latency: latency || null,
      error: error || null,
    };
  }

  #minLatency(results) {
    const latencies = results
      .filter((result) => typeof result.latency === "number")
      .map((result) => result.latency);

    return latencies.length ? Math.min(...latencies) : null;
  }

  #summarizeResult(result) {
    if (!result) {
      return "no-result";
    }

    if (result.success) {
      return `available:${result.protocol || "unknown"}:${result.address || "unknown"}:${result.port || "unknown"}`;
    }

    return `unavailable:${result.protocol || "unknown"}:${result.address || "unknown"}:${result.port || "unknown"}`;
  }
}

module.exports = ProbeEngine;

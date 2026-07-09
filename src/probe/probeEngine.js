const net = require("net");

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

    const attempts = [];
    for (let attempt = 0; attempt < this.retries; attempt += 1) {
      attempts.push(this.#probeTcp(config));
    }

    try {
      const results = await Promise.all(attempts);
      const success = results.some((result) => result.success);

      if (success) {
        return this.#buildResult({
          config,
          success: true,
          status: "available",
          reason: "tcp_connected",
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

    return Promise.all(configs.map((config) => this.probeConfig(config)));
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
}

module.exports = ProbeEngine;

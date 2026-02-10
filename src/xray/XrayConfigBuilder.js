class XrayConfigBuilder {
  createJsonObject(configs) {
    return {
      log: this.#log(),
      inbounds: this.#inbounds(),
      outbounds: this.#outbounds(configs),
      routing: this.#routing(),
    };
  }

  #log() {}

  #inbounds() {}

  #outbounds(configs) {
    return configs.map((conf) => conf.toXrayOutbound());
  }

  #routing() {}
}

module.exports = XrayConfigBuilder;

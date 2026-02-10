class XrayConfigBuilder {
  constructor(activeOutboundTag = "proxy-0") {
    this.activeOutboundTag = activeOutboundTag;
  }

  createJsonObject(configs) {
    return {
      log: this.#log(),
      inbounds: this.#inbounds(),
      outbounds: this.#outbounds(configs),
      routing: this.#routing(),
    };
  }

  #log() {
    return {
      logLevel: "warning",
    };
  }

  #inbounds() {
    return [
      {
        tag: "socks-in",
        port: 1080,
        listen: "127.0.0.1",
        protocol: "socks",
        settings: {
          udp: true,
        },
      },
    ];
  }

  #outbounds(configs) {
    return configs.map((conf, index) => conf.toXrayOutbound(`proxy-${index}`));
  }

  #routing() {
    return {
      rules: [
        {
          type: "field",
          inboundTag: ["socks-in"],
          outboundTag: this.activeOutboundTag,
        },
      ],
    };
  }
}

module.exports = XrayConfigBuilder;

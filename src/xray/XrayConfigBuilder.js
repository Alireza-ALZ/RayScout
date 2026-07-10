class XrayConfigBuilder {
  constructor(activeOutboundTag) {
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
    const outbounds = configs.map((conf, index) => {
      const outbound = conf.toXrayOutbound();
      if (!outbound.tag) {
        outbound.tag = `outbound-${index}`;
      }
      return outbound;
    });

    if (!this.activeOutboundTag && outbounds.length > 0) {
      this.activeOutboundTag = outbounds[0].tag;
    }

    return outbounds;
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

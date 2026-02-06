const BaseConfig = require("./base");

class VlessConfig extends BaseConfig {
  constructor({
    id,
    address,
    port,
    uuid,
    encryption = "none",
    flow,
    network = "tcp",
    security = "none",
    sni,
    path,
    remark,
  }) {
    super({ protocol: "vless", id, address, port, remark });

    this.uuid = uuid;
    this.encryption = encryption;
    this.flow = flow;
    this.network = network;
    this.security = security;
    this.sni = sni;
    this.path = path;
  }

  validate() {
    if (!this.uuid) throw new Error("VLESS: uuid is required");
    if (!this.address) throw new Error("VLESS: address is required");
    if (!this.port || this.port <= 0) throw new Error("VLESS: invalid port");
  }

  toXrayOutbound() {
    return {
      tag: this.id,
      protocol: "vless",
      settings: {
        vnext: [
          {
            address: this.address,
            port: this.port,
            users: [
              {
                id: this.uuid,
                encryption: this.encryption,
                flow: this.flow,
              },
            ],
          },
        ],
      },
      streamSettings: {
        network: this.network,
        security: this.security,
        tlsSettings:
          this.security === "tls" ? { serverName: this.sni } : undefined,
        wsSettings:
          this.network === "ws" ? { path: this.path || "/" } : undefined,
      },
    };
  }
}

module.exports = VlessConfig;

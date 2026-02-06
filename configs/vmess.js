const BaseConfig = require("./base");

class VmessConfig extends BaseConfig {
  constructor({
    id,
    address,
    port,
    uuid,
    alterId = 0,
    security = "auto",
    remark,
  }) {
    super({ protocol: "vmess", id, address, port, remark });

    this.uuid = uuid;
    this.alterId = alterId;
    this.security = security;
  }

  validate() {
    if (!this.uuid) throw new Error("VMess: uuid is required");
  }

  toXrayOutbound() {
    return {
      tag: this.id,
      protocol: "vmess",
      settings: {
        vnext: [
          {
            address: this.address,
            port: this.port,
            users: [
              {
                id: this.uuid,
                alterId: this.alterId,
                security: this.security,
              },
            ],
          },
        ],
      },
    };
  }
}

module.exports = VmessConfig;

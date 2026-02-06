class BaseConfig {
  constructor({ protocol, id, address, port, remark }) {
    if (new.target === BaseConfig) {
      throw new Error("BaseConfig cannot be instantiated directly");
    }

    this.protocol = protocol;
    this.id = id;
    this.address = address;
    this.port = port;
    this.remark = remark || "";
  }

  validate() {
    throw new Error("validate() must be implemented");
  }

  toXrayOutbound() {
    throw new Error("toXrayOutbound() must be implemented");
  }

  toJSON() {
    return {
      protocol: this.protocol,
      id: this.id,
      address: this.address,
      port: this.port,
      remark: this.remark,
    };
  }
}

module.exports = BaseConfig;

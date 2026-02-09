const { createConfig } = require("../../configs/index");
const VmessParser = require("../parsers/vemss.parser");
const VlessParser = require("../parsers/vless.parser");

class ConfigFactory {
  processConfigs(configs) {
    return configs
      .map((config) => {
        try {
          return this.#parseConfig(config);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);
  }

  #parseConfig(configUri) {
    if (configUri.startsWith("vless")) {
      return createConfig("vless", new VlessParser().parseVlessUri(configUri));
    }
    
    if (configUri.startsWith("vmess")) {
      return createConfig("vmess", new VmessParser().parseVmessUri(configUri));
    }

    throw new Error("Unsupproted protocol");
  }
}

module.exports = new ConfigFactory();

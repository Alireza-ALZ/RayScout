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
    let parsedConfig;

    if (configUri.startsWith("vless")) {
      parsedConfig = new VlessParser().parseVlessUri(configUri);
      return createConfig("vless", {
        ...parsedConfig,
        address: parsedConfig.address || parsedConfig.host,
      });
    }

    if (configUri.startsWith("vmess")) {
      parsedConfig = new VmessParser().parseVmessUri(configUri);
      return createConfig("vmess", {
        ...parsedConfig,
        address: parsedConfig.address || parsedConfig.host,
      });
    }

    throw new Error("Unsupproted protocol");
  }
}

module.exports = new ConfigFactory();

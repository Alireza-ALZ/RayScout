const { createConfig } = require("../../configs/index");
const VlessConfig = require("../../configs/vless");
const VmessConfig = require("../../configs/vmess");
const VmessParser = require("../parsers/vemss.parser");
const VlessParser = require("../parsers/vless.parser");

class ConfigFactory {
  processConfigs(configs) {
    return configs.map((config) => this.#parseConfig(config));
  }

  #parseConfig(configUri) {
    if (configUri.startsWith("vless")) {
      return createConfig(
        "vless",
        new VlessConfig(new VlessParser().parseVlessUri(configUri)),
      );
    }
    if (configUri.startsWith("vmess")) {
      return createConfig(
        "vmess",
        new VmessConfig(new VmessParser().parseVmessUri(configUri)),
      );
    }
  }
}

module.exports = new ConfigFactory();

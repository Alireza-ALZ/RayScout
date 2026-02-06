const VlessConfig = require("./vless");
const VmessConfig = require("./vmess");

function createConfig(protocol, configData) {
  switch (protocol.toLowerCase()) {
    case "vless":
      return new VlessConfig(configData);
    case "vmess":
      return new VmessConfig(configData);
    default:
      throw new Error("Invalid Protocol !");
  }
}

module.exports = { createConfig };

const ConfigFactory = require("./src/factory/configFactory");
const ConfigSelector = require("./src/selector/configSelector");
const XrayConfigBuilder = require("./src/xray/XrayConfigBuilder");

const allConfigs = [
  "vless://UUID@domain.com:443?type=ws&security=tls&path=%2Fws&sni=domain.com#My%20VLESS",
  "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImFiYzEtMTIzNCIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiIvd3MiLCJ0bHMiOiJ0bHMiLCJwcyI6Ik15IFZNRVNzIn0=#My VMess Server",
];

const configs = ConfigFactory.processConfigs(allConfigs);

const selector = new ConfigSelector(configs);
selector.selectFirst();

const builder = new XrayConfigBuilder();
const xrayConfig = builder.createJsonObject(configs);

console.log(xrayConfig);

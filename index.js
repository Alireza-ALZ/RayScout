const ConfigFactory = require("./src/factory/configFactory");
const XrayConfigBuilder = require("./src/xray/XrayConfigBuilder");

const allConfigs = [
  "vless://UUID@domain.com:443?type=ws&security=tls&path=%2Fws&sni=domain.com#My%20VLESS",
  "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImFiYzEtMTIzNCIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiIvd3MiLCJ0bHMiOiJ0bHMiLCJwcyI6Ik15IFZNRVNzIn0=#My VMess Server",
];

const result = ConfigFactory.processConfigs(allConfigs);

const configsJson = new XrayConfigBuilder().createJsonObject(result);

console.log(configsJson);

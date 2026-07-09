const ConfigFactory = require("./src/factory/configFactory");
const ConfigSelector = require("./src/selector/configSelector");
const ProbeEngine = require("./src/probe/probeEngine");
const XrayConfigBuilder = require("./src/xray/XrayConfigBuilder");

const allConfigs = [
  "vless://UUID@domainnnnnnnnnnnnnnnn.com:444?type=ws&security=tls&path=%2Fws&sni=domain.com#My%20VLESS",
  "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImFiYzEtMTIzNCIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiIvd3MiLCJ0bHMiOiJ0bHMiLCJwcyI6Ik15IFZNRVNzIn0=#My VMess Server",
];

async function main() {
  const configs = ConfigFactory.processConfigs(allConfigs);

  const selector = new ConfigSelector(configs);
  selector.selectFirst();

  const probeEngine = new ProbeEngine({ timeout: 2000, retries: 1 });
  const probeResults = await probeEngine.probeConfigs(configs);

  const available = probeResults.filter((result) => result.success);
  const unavailable = probeResults.filter((result) => !result.success);

  const report = {
    total: probeResults.length,
    availableCount: available.length,
    unavailableCount: unavailable.length,
    available,
    unavailable,
  };

  const builder = new XrayConfigBuilder();
  const xrayConfig = builder.createJsonObject(configs);

  console.log(
    JSON.stringify(
      {
        report,
        probeResults,
        xrayConfig,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

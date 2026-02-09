const { expect } = require("chai");
const ConfigFactory = require("../../../src/factory/configFactory");

describe("Config Factory Test", () => {
  it("Correct Test", () => {
    const allConfigs = [
      "vless://UUID@domain.com:443?type=ws&security=tls&path=%2Fws&sni=domain.com#My%20VLESS",
      "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImFiYzEtMTIzNCIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiIvd3MiLCJ0bHMiOiJ0bHMiLCJwcyI6Ik15IFZNRVNzIn0=#My VMess Server",
    ];

    const result = ConfigFactory.processConfigs(allConfigs);

    expect(result).to.deep.equal([
      {
        protocol: "vless",
        id: undefined,
        address: undefined,
        port: 443,
        remark: "My VLESS",
        uuid: "UUID",
        encryption: "none",
        flow: undefined,
        network: "ws",
        security: "tls",
        sni: "domain.com",
        path: "/ws",
      },
      {
        protocol: "vmess",
        id: undefined,
        address: undefined,
        port: 443,
        remark: "My VMess Server",
        uuid: "abc1-1234",
        alterId: 0,
        security: "tls",
      },
    ]);
  });
});

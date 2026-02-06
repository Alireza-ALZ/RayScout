const { expect } = require("chai");
const VlessParser = require("../../../src/parsers/vless.parser");

const vlessParserInstance = new VlessParser();

describe("Vless Parser Test", () => {
  it("Correct URI", () => {
    const uri =
      "vless://UUID@domain.com:443?type=ws&security=tls&path=%2Fws&sni=domain.com#My%20VLESS";
    const result = vlessParserInstance.parseVlessUri(uri);

    expect(result).deep.equal({
      uuid: "UUID",
      host: "domain.com",
      port: 443,
      encryption: "none",
      security: "tls",
      network: "ws",
      path: "/ws",
      sni: "domain.com",
      flow: undefined,
      remark: "My%20VLESS",
    });
  });

  it("Wrong URI", () => {
    const uri = "vmess://xxxx";
    const result = vlessParserInstance.parseVlessUri(uri);

    expect(result).throws();
  });
});

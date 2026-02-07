const { expect } = require("chai");
const VmessParser = require("../../../src/parsers/vemss.parser");

const vmessParserInstance = new VmessParser();

describe("Vmess Parser Test", () => {
  it("Correct Config", () => {
    const vmessUri =
      "vmess://eyJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImFiYzEtMTIzNCIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiIvd3MiLCJ0bHMiOiJ0bHMiLCJwcyI6Ik15IFZNRVNzIn0=#My VMess Server";
    const result = vmessParserInstance.parseVmessUri(vmessUri);

    expect(result).to.deep.equal({
      uuid: "abc1-1234",
      host: "example.com",
      port: 443,
      alterId: 0,
      network: "ws",
      path: "/ws",
      sni: undefined,
      security: "tls",
      remark: "My VMess Server",
    });
  });

  it("Wrong Config 1", () => {
    const vmessUri =
      "vless://eyJhZGQiOiJleGFtcGxlLmNvbSIsInBvcnQiOiI0NDMiLCJpZCI6ImFiYzEtMTIzNCIsImFpZCI6IjAiLCJuZXQiOiJ3cyIsInBhdGgiOiIvd3MiLCJ0bHMiOiJ0bHMiLCJwcyI6Ik15IFZNRVNzIn0=#My VMess Server";

    expect(() => vmessParserInstance.parseVmessUri(vmessUri)).to.throw(
      "Invalid Protocol",
    );
  });

  it("Wrong Config 2", () => {
    const vmessUri = "vmess://eyJhZGQiOiJCIsImNzIn0=#My VMess Server";

    expect(() => vmessParserInstance.parseVmessUri(vmessUri)).to.throw(
      "Invalid Vmess Base64 JSON",
    );
  });
});

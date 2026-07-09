const { expect } = require("chai");
const net = require("net");
const ProbeEngine = require("../../../src/probe/probeEngine");

describe("Probe Engine Test", () => {
  let server;

  before((done) => {
    server = net.createServer((socket) => {
      socket.end("ok");
    });

    server.listen(0, "127.0.0.1", done);
  });

  after((done) => {
    server.close(done);
  });

  it("marks a reachable config as reachable", async () => {
    const probe = new ProbeEngine({ timeout: 1000 });
    const result = await probe.probeConfig({
      address: "127.0.0.1",
      port: server.address().port,
      protocol: "vless",
    });

    expect(result.success).to.equal(true);
    expect(result.status).to.equal("reachable");
    expect(result.reason).to.equal("tcp_connected");
  });

  it("marks an unreachable config as unreachable", async () => {
    const probe = new ProbeEngine({ timeout: 400 });
    const result = await probe.probeConfig({
      address: "127.0.0.1",
      port: 65534,
      protocol: "vmess",
    });

    expect(result.success).to.equal(false);
    expect(result.status).to.equal("unreachable");
  });
});

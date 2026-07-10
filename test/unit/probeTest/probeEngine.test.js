const { expect } = require("chai");
const { EventEmitter } = require("events");
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

  it("marks a available config as available", async () => {
    const probe = new ProbeEngine({ timeout: 1000 });
    const result = await probe.probeConfig({
      address: "127.0.0.1",
      port: server.address().port,
      protocol: "vless",
    });

    expect(result.success).to.equal(true);
    expect(result.status).to.equal("available");
    expect(result.reason).to.equal("tcp_connected");
  });

  it("marks an unavailable config as unavailable", async () => {
    const probe = new ProbeEngine({ timeout: 400 });
    const result = await probe.probeConfig({
      address: "127.0.0.1",
      port: 65534,
      protocol: "vmess",
    });

    expect(result.success).to.equal(false);
    expect(result.status).to.equal("unavailable");
  });

  it("marks a config with an unresolved host as invalid", async () => {
    const probe = new ProbeEngine({ timeout: 400 });
    const result = await probe.probeConfig({
      address: "this-host-should-not-resolve.invalid",
      port: 443,
      protocol: "vless",
    });

    expect(result.success).to.equal(false);
    expect(result.status).to.equal("invalid");
    expect(result.reason).to.equal("dns_resolution_failed");
  });

  it("uses Xray runner when xrayBinaryPath is provided", async () => {
    const fakeRunner = class FakeXrayRunner extends EventEmitter {
      constructor() {
        super();
        this.process = this;
      }

      start() {
        setImmediate(() => {
          this.emit("error", new Error("fake xray start failure"));
        });
      }

      stop() {}
    };

    const probe = new ProbeEngine({
      timeout: 400,
      xrayBinaryPath: "/usr/bin/fake-xray",
      xrayRunnerClass: fakeRunner,
    });

    const result = await probe.probeConfig({
      address: "127.0.0.1",
      port: server.address().port,
      protocol: "vless",
      id: "fake-xray",
      toXrayOutbound() {
        return {
          tag: "fake-xray",
          protocol: "vless",
          settings: {
            vnext: [
              {
                address: "127.0.0.1",
                port: server.address().port,
                users: [{ id: "uuid" }],
              },
            ],
          },
        };
      },
    });

    expect(result.success).to.equal(false);
    expect(result.status).to.equal("unavailable");
    expect(result.reason).to.equal("xray_process_error");
    expect(result.error).to.equal("fake xray start failure");
  });

  it("probes multiple configs and returns a batch report", async () => {
    const probe = new ProbeEngine({ timeout: 400 });
    const results = await probe.probeConfigs([
      {
        id: "available-config",
        address: "127.0.0.1",
        port: server.address().port,
        protocol: "vless",
      },
      {
        id: "unavailable-config",
        address: "127.0.0.1",
        port: 65534,
        protocol: "vmess",
      },
    ]);

    expect(results).to.have.lengthOf(2);
    expect(
      results.find((item) => item.configId === "available-config").success,
    ).to.equal(true);
    expect(
      results.find((item) => item.configId === "unavailable-config").success,
    ).to.equal(false);
  });
});

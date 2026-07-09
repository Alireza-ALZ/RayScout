class XrayRunner {
  constructor() {}
}

module.exports = XrayRunner;

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class XrayRunner {
  constructor(xrayBinaryPath) {
    this.xrayBinaryPath = xrayBinaryPath;
    this.process = null;
    this.configPath = null;
  }

  start(configObject) {
    if (this.process) {
      throw new Error("Xray is already running");
    }

    this.configPath = this.#writeTempConfig(configObject);

    this.process = spawn(this.xrayBinaryPath, [
      "run",
      "-config",
      this.configPath,
    ]);

    this.process.stdout.on("data", (data) => {
      console.log("[xray]", data.toString());
    });

    this.process.stderr.on("data", (data) => {
      console.error("[xray error]", data.toString());
    });

    this.process.on("exit", (code) => {
      console.log(`[xray] exited with code ${code}`);
      this.process = null;
    });
  }

  stop() {
    if (!this.process) return;

    this.process.kill("SIGTERM");
    this.process = null;

    if (this.configPath && fs.existsSync(this.configPath)) {
      fs.unlinkSync(this.configPath);
      this.configPath = null;
    }
  }

  #writeTempConfig(configObject) {
    const filePath = path.join(process.cwd(), `xray-config-${Date.now()}.json`);

    fs.writeFileSync(filePath, JSON.stringify(configObject, null, 2));
    return filePath;
  }
}

module.exports = XrayRunner;

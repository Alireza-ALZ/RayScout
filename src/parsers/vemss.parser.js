class VmessParser {
  parseVmessUri(uri) {
    if (!this.#isProtocolValid(uri)) throw new Error("Invalid Protocol");

    const newUri = uri.replace("vmess://", "");
    const [base64Part, remarkPart] = newUri.split("#");

    const remark = remarkPart ? decodeURIComponent(remarkPart) : remarkPart;

    let json;
    try {
      const jsonStr = Buffer.from(base64Part, "base64").toString("utf-8");
      json = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error("Invalid Vmess Base64 JSON");
    }

    return {
      uuid: json.id,
      host: json.add,
      port: Number(json.port),
      alterId: Number(json.aid || 0),
      network: json.net || "tcp",
      path: json.path ? decodeURIComponent(json.path) : undefined,
      sni: json.host || undefined,
      security: json.tls || "none",
      remark: remark || json.ps || "",
    };
  }

  #isProtocolValid(uri) {
    return uri.startsWith("vmess://");
  }
}

module.exports = VmessParser;

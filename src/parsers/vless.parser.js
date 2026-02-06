class VlessParser {
  parseVlessUri(uri) {
    try {
      if (!this.#isProtocolValid(uri)) throw new Error("Invalid Protocol");

      const newUri = uri.replace("vless://", "");

      const remark = this.#extractRemark(newUri) || "";

      const { uuid, host, port } = this.#extractMain(newUri);

      const { encryption, security, network, path, sni, flow } =
        this.#extractQueryParams(newUri);

      return {
        uuid,
        host,
        port,
        encryption,
        security,
        network,
        path,
        sni,
        flow,
        remark,
      };
    } catch (error) {
      throw new Error(error?.message);
    }
  }

  #isProtocolValid(uri) {
    return uri.startsWith("vless://");
  }

  #extractRemark(uri) {
    const remark = uri.split("#")[1];

    return remark ? decodeURIComponent(remark) : undefined;
  }

  #extractMain(uri) {
    const uriMain = uri.split("?")[0];
    const [uuidPart, hostPort] = uriMain.split("@");
    if (!uuidPart || !hostPort) throw new Error("Invalid VLESS main part");

    const [host, portStr] = hostPort.split(":");
    if (!host || !portStr) throw new Error("Invalid VLESS host/port");

    return { uuid: uuidPart, host, port: Number(portStr) };
  }

  #extractQueryParams(uri) {
    const uriQuery = uri.split("?")[1];

    if (!uriQuery)
      return {
        encryption: "none",
        security: "none",
        network: "tcp",
        path: undefined,
        sni: undefined,
        flow: undefined,
      };

    const cleanQuery = uriQuery.split("#")[0];

    const params = new URLSearchParams(cleanQuery);

    return {
      encryption: params.get("encryption") || "none",
      security: params.get("security") || "none",
      network: params.get("type") || "tcp",
      path: params.get("path")
        ? decodeURIComponent(params.get("path"))
        : undefined,
      sni: params.get("sni") || undefined,
      flow: params.get("flow") || undefined,
    };
  }
}

module.exports = VlessParser;

class ConfigSelector {
  constructor(configs) {
    this.configs = configs;
    this.activeConfigId = null;
  }

  selectById(id) {
    const exist = this.configs.some((conf) => conf.id === id);

    if (!exist) throw new Error(`Config with id "${id}" not found`);

    this.activeConfigId = id;
  }

  selectFirst() {
    if (this.configs.length === 0) throw new Error("No configs available");

    this.activeConfigId = this.configs[0].id;
  }

  getActiveConfigId() {
    if (!this.activeConfigId) throw new Error("No active config selected");

    return this.activeConfigId;
  }
}

module.exports = ConfigSelector;

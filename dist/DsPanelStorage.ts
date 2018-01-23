import DsPanel from "./DsPanel";

class DsPanelStorage {
  panels: Map<string, DsPanel>;

  constructor() {
    this.panels = new Map<string, DsPanel>();
  }

  getOrGreatePanel(panelId: string, queryStr: string): DsPanel {
    let panel = this.panels.get(panelId);
    if (!panel) {
      panel = new DsPanel(queryStr);
      this.panels.set(panelId, panel);
    } else {
      panel.updateQueryParams({queryString: queryStr});
    }
    return panel;
  }
}

export default DsPanelStorage;

import DsPanel from "./DsPanel";

class DsPanelStorage {
  panels: Map<string, DsPanel>;

  constructor() {
    this.panels = new Map<string, DsPanel>();
  }

  getOrCreatePanel(panelId: string): DsPanel {
    let panel = this.panels.get(panelId);
    if (!panel) {
      panel = new DsPanel();
      this.panels.set(panelId, panel);
    }
    return panel;
  }
}

export default DsPanelStorage;

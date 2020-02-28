import Panel from "./panel";

class PanelManager {
  panels: Map<string, Panel>;

  constructor() {
    this.panels = new Map<string, Panel>();
  }

  getOrCreatePanel(panelId: string): Panel {
    let panel = this.panels.get(panelId);
    if (!panel) {
      panel = new Panel();
      this.panels.set(panelId, panel);
    }
    return panel;
  }
}

export default PanelManager;

import DsPanel from "./DsPanel";

class DsPanelStorage {
  panels: Map<string, DsPanel>;
  backendSrv: any;

  constructor(backendSrv: any) {
    this.backendSrv = backendSrv;
    this.panels = new Map<string, DsPanel>();
  }

  getOrGreatePanel(panelId: string, queryStr: string): DsPanel | null {
    let panel = this.panels.get(panelId);
    if (!panel) {
      panel = new DsPanel(queryStr, this.backendSrv);
      this.panels.set(panelId, panel);
    } else {
      panel.updateQueryParams({queryString: queryStr});
    }
    return panel;
  }
}

export default DsPanelStorage;

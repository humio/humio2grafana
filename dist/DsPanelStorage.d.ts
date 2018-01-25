import DsPanel from "./DsPanel";
declare class DsPanelStorage {
    panels: Map<string, DsPanel>;
    constructor();
    getOrGreatePanel(panelId: string): DsPanel;
}
export default DsPanelStorage;

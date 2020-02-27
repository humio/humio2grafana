import DsPanel from "./DsPanel";
declare class DsPanelStorage {
    panels: Map<string, DsPanel>;
    constructor();
    getOrCreatePanel(panelId: string): DsPanel;
}
export default DsPanelStorage;

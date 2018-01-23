import DsPanel from "./DsPanel";
declare class DsPanelStorage {
    panels: Map<string, DsPanel>;
    constructor();
    getOrGreatePanel(panelId: string, queryStr: string): DsPanel;
}
export default DsPanelStorage;

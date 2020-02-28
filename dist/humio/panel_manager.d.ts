import Panel from "./panel";
declare class PanelManager {
    panels: Map<string, Panel>;
    constructor();
    getOrCreatePanel(panelId: string): Panel;
}
export default PanelManager;

System.register(["./panel"], function (exports_1, context_1) {
    "use strict";
    var panel_1, PanelManager;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (panel_1_1) {
                panel_1 = panel_1_1;
            }
        ],
        execute: function () {
            PanelManager = (function () {
                function PanelManager() {
                    this.panels = new Map();
                }
                PanelManager.prototype.getOrCreatePanel = function (panelId) {
                    var panel = this.panels.get(panelId);
                    if (!panel) {
                        panel = new panel_1.default();
                        this.panels.set(panelId, panel);
                    }
                    return panel;
                };
                return PanelManager;
            }());
            exports_1("default", PanelManager);
        }
    };
});
//# sourceMappingURL=panel_manager.js.map
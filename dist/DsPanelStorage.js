System.register(["./DsPanel"], function(exports_1) {
    var DsPanel_1;
    var DsPanelStorage;
    return {
        setters:[
            function (DsPanel_1_1) {
                DsPanel_1 = DsPanel_1_1;
            }],
        execute: function() {
            DsPanelStorage = (function () {
                function DsPanelStorage() {
                    this.panels = new Map();
                }
                DsPanelStorage.prototype.getOrGreatePanel = function (panelId) {
                    var panel = this.panels.get(panelId);
                    if (!panel) {
                        panel = new DsPanel_1.default();
                        this.panels.set(panelId, panel);
                    }
                    return panel;
                };
                return DsPanelStorage;
            })();
            exports_1("default",DsPanelStorage);
        }
    }
});
//# sourceMappingURL=DsPanelStorage.js.map
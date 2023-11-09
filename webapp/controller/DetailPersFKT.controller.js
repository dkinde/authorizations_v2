sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/f/library"
], function (Controller,
    UIComponent,
    ODataModel,
    JSONModel,
    Sorter,
    Filter,
    FilterOperator,
    FilterType,
    Fragment,
    MessageToast,
    MessageBox,
    Spreadsheet,
    fioriLibrary
) {
    "use strict";

    return Controller.extend("auth.controller.DetailPersFKT", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            sap.ui.getCore().getConfiguration().setLanguage("de");
            this.oRouter = UIComponent.getRouterFor(this);

            this.oRouter.getRoute("RouteDetailPersFKT").attachPatternMatched(this._onFunktionMatched, this);
            //this.oRouter.getRoute("RouteHAUPF001").attachPatternMatched(this._onFunktionMatched, this);
        },
        onCancelTwoColumns: function () {
            UIComponent.getRouterFor(this).navTo("RouteHAUPF001");
            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
        },
        _onFunktionMatched: function (oEvent) {
            var iFunktion = oEvent.getParameter("arguments").funktion || iFunktion || "0",
                oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, iFunktion);
            // this._funktion = oEvent.getParameter("arguments").funktion || this._funktion || "0";

            this.byId("funktionTable").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
            this.byId("funktionTable1").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

            /* this.getView().bindElement({
                path: "/HAUFW001/" + this._funktion,
                model: this._oModel
            }); */
        },
        onExit: function () {
            this.oRouter.getRoute("RouteDetailPersFKT").detachPatternMatched(this._onFunktionMatched, this);
            // this.oRouter.getRoute("RouteHAUPF001").detachPatternMatched(this._onFunktionMatched, this);
        }
    });
});
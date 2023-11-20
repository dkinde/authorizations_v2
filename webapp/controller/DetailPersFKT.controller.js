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
        // Initialization function
        onInit: function () {
            // Global variables
            // Get the OData model from the owner component
            this._oModel = this.getOwnerComponent().getModel();
            // Get the router for navigation
            this.oRouter = UIComponent.getRouterFor(this);
            // Attach the "_onFunktionMatched" function to the "patternMatched" event of the "RouteDetailPersFKT" route
            this.oRouter.getRoute("RouteDetailPersFKT").attachPatternMatched(this._onFunktionMatched, this);

            // Set the language of the entire app to German
            sap.ui.getCore().getConfiguration().setLanguage("de");

            //this.oRouter.getRoute("RouteHAUPF001").attachPatternMatched(this._onFunktionMatched, this);
        },
        // Function triggered when a match is found for a 'funktion'
        _onFunktionMatched: function (oEvent) {
            // Get the value of 'funktion' from the event parameters or assign "0" if undefined
            var iFunktion = oEvent.getParameter("arguments").funktion || iFunktion || "0";

            // Create a filter for the "funktion" property with the obtained value
            var oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, iFunktion);

            // Apply the filter to the table with ID "funktionTable" and specify it as an application filter
            this.byId("funktionTable").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

            // Apply the same filter to another table with ID "funktionTable1"
            this.byId("funktionTable1").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
        },
        // Function to cancel and navigate to the "RouteHAUPF001"
        onCancelTwoColumns: function () {
            // Navigate to the "RouteHAUPF001" route using the UIComponent router
            UIComponent.getRouterFor(this).navTo("RouteHAUPF001");

            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
        },
        // Exit function that is executed when leaving the controller
        onExit: function () {
            // Detach the "patternMatched" event from the "RouteDetailPersFKT" route to prevent memory leaks
            this.oRouter.getRoute("RouteDetailPersFKT").detachPatternMatched(this._onFunktionMatched, this);

            // this.oRouter.getRoute("RouteHAUPF001").detachPatternMatched(this._onFunktionMatched, this);
        }
    });
});
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

    return Controller.extend("auth.controller.MasterPersFKT", {
        // Initialization function
        onInit: function () {
            // Get the OData model from the owner component
            this._oModel = this.getOwnerComponent().getModel();
            // Set the language to German
            sap.ui.getCore().getConfiguration().setLanguage("de");

            // Get the view and router references
            this.oView = this.getView();
            this.oRouter = UIComponent.getRouterFor(this);
            // Attach the route matched event handler
            this.oRouter.attachRouteMatched(this.onRouteMatched, this);
        },

        // Event handler for route matched event
        onRouteMatched: function (oEvent) {
            // Get the current route name and arguments
            var sRouteName = oEvent.getParameter("name"),
                oArguments = oEvent.getParameter("arguments");

            // Save the current route name and funktion from the arguments
            this.currentRouteName = sRouteName;
            this.currentFunktion = oArguments.funktion;
        },

        // Event handler for state changed event
        onStateChanged: function (oEvent) {
            // Get parameters from the event
            var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
                sLayout = oEvent.getParameter("layout");

            // Replace the URL with the new layout if a navigation arrow was used
            if (bIsNavigationArrow) {
                // Navigate to the current route with the new layout and funktion
                this.oRouter.navTo(this.currentRouteName, { layout: sLayout, funktion: this.currentFunktion }, true);
            }
        },

        // Exit function
        onExit: function () {
            // Detach the route matched event handler when the view is exited
            this.oRouter.detachRouteMatched(this.onRouteMatched, this);
        }

    });
});
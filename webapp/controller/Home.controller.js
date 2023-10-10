sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("authorizationsv2.controller.Home", {
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();
            },
            onNavToBasisKonfig: function () {
                this.getRouter().navTo("RouteBasisKonfig");
            },
            onNavToFunktion: function () {
                this.getRouter().navTo("RouteFunktion");
            },
            onNavToWizard: function () {
                this.getRouter().navTo("RouteWizard");
            },
            onNavToKontroll: function () {
                this.getRouter().navTo("RouteKontroll");
            },
            onNavToPersPlan: function () {
                this.getRouter().navTo("RoutePersPlan");
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            getEntityCount: function (entities) {
                return entities && entities.length || 0;
            }
        });
    });

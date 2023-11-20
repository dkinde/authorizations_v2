sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("auth.controller.Home", {
            // Initialization function called when the view is created
            onInit: function () {
                // Set the language to German for the application
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();

                // Get the OData model from the owner component
                this._oModel = this.getOwnerComponent().getModel();
                var that = this;

                // AJAX request to retrieve the count of entities for HAUKB001
                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUKB001" + "/$count",
                    method: "GET",
                    success: function (data) {
                        // Set the count value in the corresponding numeric control
                        that.getView().byId("numericCont1").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Error querying Entity 1:", errorEntit1);
                    }
                });

                // AJAX request to retrieve the count of entities for HAUPLPHA
                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUPLPHA" + "/$count",
                    method: "GET",
                    success: function (data) {
                        // Set the count value in the corresponding numeric control
                        that.getView().byId("numericCont2").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Error querying Entity 2:", errorEntit1);
                    }
                });
            },

            // Function to navigate to the "RouteBasisKonfig" route
            onNavToBasisKonfig: function () {
                this.getRouter().navTo("RouteBasisKonfig");
            },

            // Function to navigate to the "RouteFunktion" route
            onNavToFunktion: function () {
                this.getRouter().navTo("RouteFunktion");
            },

            // Function to navigate to the "RouteWizard" route
            onNavToWizard: function () {
                this.getRouter().navTo("RouteWizard");
            },

            // Function to navigate to the "RouteKontroll" route
            onNavToKontroll: function () {
                this.getRouter().navTo("RouteKontroll");
            },

            // Function to navigate to the "RoutePersPlan" route
            onNavToPersPlan: function () {
                this.getRouter().navTo("RoutePersPlan");
            },

            // Function to get the router from the owner component
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            }

        });
    });

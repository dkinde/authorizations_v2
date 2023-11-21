sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent) {
        "use strict";

        return Controller.extend("auth.controller.Funktion", {
            // Initialization function called when the view is created
            onInit: function () {
                // Set the language to German for the application
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();

                // Get the OData model from the owner component
                this._oModel = this.getOwnerComponent().getModel();

                var that = this;

                // AJAX request to retrieve the count of entities for HAUFW001
                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUFW001" + "/$count",
                    method: "GET",
                    success: function (data) {
                        // Set the count value in the corresponding numeric control
                        that.getView().byId("numericCont1").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage einer Entität 1:", errorEntit1);
                    }
                });

                // AJAX request to retrieve the count of entities for HAUPF001
                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUPF001" + "/$count",
                    method: "GET",
                    success: function (data) {
                        // Set the count value in the corresponding numeric control
                        that.getView().byId("numericCont2").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage einer Entität 2:", errorEntit1);
                    }
                });
            },

            // Function called when the navigation button is pressed
            onNavButtonPressed: function () {
                // Navigate to the "RouteHome" route
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
            },

            // Function to navigate to the "RouteHAUFW001" route
            onNavToHAUFW001: function () {
                this.getRouter().navTo("RouteHAUFW001");
            },

            // Function to navigate to the "RouteHAUPF001" route
            onNavToHAUPF001: function () {
                this.getRouter().navTo("RouteHAUPF001");
            },

            // Function to navigate to the "RouteMasterPersFKT" route
            onNavToMasterPersFKT: function () {
                this.getRouter().navTo("RouteMasterPersFKT");
            },

            // Function to get the router from the owner component
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            }
        });
    });

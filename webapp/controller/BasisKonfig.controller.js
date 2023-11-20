sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent) {
        "use strict";

        return Controller.extend("auth.controller.BasisKonfig", {
            // Initialization function
            onInit: function () {
                // Set the language to German
                sap.ui.getCore().getConfiguration().setLanguage("de");
                // Apply changes to the UI
                sap.ui.getCore().applyChanges();
                // Get the OData model from the owner component
                this._oModel = this.getOwnerComponent().getModel();
                // Get a reference to the current context
                var that = this;

                // Promise to read data from the "AUDMART" entity
                var promise1 = new Promise(function (resolve, reject) {
                    this._oModel.read("/AUDMART", {
                        success: function (oData) {
                            resolve(oData.results);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                }.bind(this));

                // Promise to read data from the "AUMPVDM" entity
                var promise2 = new Promise(function (resolve, reject) {
                    this._oModel.read("/AUMPVDM", {
                        success: function (oData) {
                            resolve(oData.results);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                }.bind(this));

                // Use Promise.all to wait for both promises to resolve
                Promise.all([promise1, promise2])
                    .then(function (results) {
                        // Extract data from the resolved promises
                        var dataEntit1 = results[0],
                            dataEntit2 = results[1],
                            Total = dataEntit1.length + dataEntit2.length;

                        // Set the value of a UI element with the calculated total
                        that.getView().byId("numericCont1").setValue(Total.toString());
                    })
                    .catch(function (error) {
                        console.error("Error retrieving data:", error);
                    });

                // Using jQuery AJAX to get the count for the "HAUPARZL" entity
                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUPARZL" + "/$count",
                    method: "GET",
                    success: function (data) {
                        // Set the value of another UI element with the count
                        that.getView().byId("numericCont2").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Error querying entity 1:", errorEntit1);
                    }
                });
            },

            // Event handler for the navigation button pressed
            onNavButtonPressed: function () {
                // Get the router and navigate to the "RouteHome"
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
            },

            // Event handler for navigation to "AUDMART"
            onNavToAUDMART: function () {
                // Get the router and navigate to "RouteAUDMART"
                this.getRouter().navTo("RouteAUDMART");
            },

            // Event handler for navigation to "HAUPARZL"
            onNavToHAUPARZL: function () {
                // Get the router and navigate to "RouteHAUPARZL"
                this.getRouter().navTo("RouteHAUPARZL");
            },

            // Function to get the router
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            }

        });
    });

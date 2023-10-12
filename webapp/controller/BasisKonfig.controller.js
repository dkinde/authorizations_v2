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
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();
                this._oModel = this.getOwnerComponent().getModel();
                var that = this;

                var promise1 = new Promise(function (resolve, reject) {
                    this._oModel.read("/AUDMART", {
                        success: function (oData, oResponse) {
                            resolve(oData.results);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                }.bind(this));

                var promise2 = new Promise(function (resolve, reject) {
                    this._oModel.read("/AUMPVDM", {
                        success: function (oData, oResponse) {
                            resolve(oData.results);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });
                }.bind(this));

                Promise.all([promise1, promise2])
                    .then(function (results) {
                        var dataEntit1 = results[0],
                            dataEntit2 = results[1],
                            Total = dataEntit1.length + dataEntit2.length;

                        that.getView().byId("numericCont1").setValue(Total.toString());
                    })
                    .catch(function (error) {
                        console.error("Error al recuperar datos:", error);
                    });

                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUPARZL" + "/$count",
                    method: "GET",
                    success: function (data) {
                        that.getView().byId("numericCont2").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });
                /* this._oModel.read("/HAUPARZL", {
                    success: function (oData, oResponse) {
                        that.getView().byId("numericCont2").setValue(oData.results.length.toString());
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                }); */
            },
            onNavButtonPressed: function () {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
            },
            onNavToAUDMART: function () {
                this.getRouter().navTo("RouteAUDMART");
            },
            onNavToHAUPARZL: function () {
                this.getRouter().navTo("RouteHAUPARZL");
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            }
        });
    });

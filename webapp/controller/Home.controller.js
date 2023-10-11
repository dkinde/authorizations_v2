sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("auth.controller.Home", {
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();
                this._oModel = this.getOwnerComponent().getModel();
                var that = this,
                    totalCount = 0,
                    batchSize = 0;

                this._oModel.read("/HAUPLPHA", {
                    success: function (oData, oResponse) {
                        that.getView().byId("numericCont2").setValue(oData.results.length.toString());
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                });

                /* function retrieveData(sUrl) {
                    that._oModel.read(sUrl, {
                        urlParameters: {
                            "$skiptoken": batchSize
                        },
                        success: function (oData, oResponse) {
                            totalCount += oData.results.length;
                            console.log(oData);
                            console.log(oResponse);
                            console.log(totalCount);
                            console.log(oData.__next);

                            if (oData.__next) {
                                // Si hay más páginas, continúa recuperando datos
                                batchSize += 100;
                                retrieveData(sUrl);
                            } else {
                                // Ya no hay más páginas, muestra el resultado
                                that.getView().byId("numericCont1").setValue(totalCount.toString());
                            }
                        },
                        error: function (oError) {
                            console.error("Error al recuperar datos:", oError);
                        }
                    });
                }

                retrieveData("/HAUKB001"); */

                this._oModel.read("/HAUKB001", {
                    success: function (oData, oResponse) {
                        console.log(oData);
                        console.log(oResponse);
                        that.getView().byId("numericCont1").setValue(oData.results.length.toString());
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                });
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
            }
        });
    });

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
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();
                this._oModel = this.getOwnerComponent().getModel();

                var that = this,
                    iSkip = 0,
                    iSkip1 = 0;

                this.aValores = [];

                //console.log(this._oModel.getProperty("HAUFW001"));

                /* this._oModel.read("/HAUFW001", {
                    urlParameters: {
                        "$count": true
                    },
                    success: function (oData, oResponse) {
                        console.log(oData.__count);
                        that.getView().byId("numericCont1").setValue(oData.__count.toString());
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                }); */

                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUFW001" + "/$count",
                    method: "GET",
                    success: function (data) {
                        that.getView().byId("numericCont1").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });
                $.ajax({
                    url: that._oModel.sServiceUrl + "/HAUPF001" + "/$count",
                    method: "GET",
                    success: function (data) {
                        that.getView().byId("numericCont2").setValue(data.toString());
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });

                /* function getData() {
                    $.ajax({
                        url: that._oModel.sServiceUrl + "/HAUFW001" + "?$top=100" + "&$skip=" + iSkip,
                        method: "GET",
                        success: function (data) {
                            console.log(data);
                            if (data && data.value) {
                                that.aValores = that.aValores.concat(data.value.map(function (item) {
                                    return item;
                                }));
                            }
                            if (data.value.length === 100) {
                                iSkip += 100;
                                getData();
                            } else {
                                return;
                            }
                        }.bind(this),
                        error: function (errorEntit1) {
                            console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                        }
                    });
                }
                getData(); */

            },
            onNavButtonPressed: function () {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
            },
            onNavToHAUFW001: function () {
                this.getRouter().navTo("RouteHAUFW001");
            },
            onNavToHAUPF001: function () {
                this.getRouter().navTo("RouteHAUPF001");
            },
            onNavToMasterPersFKT: function () {
                this.getRouter().navTo("RouteMasterPersFKT");
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            getEntityCount: function (entities) {
                return entities && entities.length || 0;
            }
        });
    });

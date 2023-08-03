sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent) {
        "use strict";

        return Controller.extend("authorization.controller.BasisKonfig", {
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de");
                sap.ui.getCore().applyChanges();

                var sUrl1 = this.getOwnerComponent().getModel().sServiceUrl + "/AUDMART",
                    sUrl2 = this.getOwnerComponent().getModel().sServiceUrl + "/AUMPVDM";

                $.ajax({
                    url: sUrl1,
                    method: "GET",
                    success: function (dataEntit1) {
                        $.ajax({
                            url: sUrl2,
                            method: "GET",
                            success: function (dataEntit2) {
                                var Total = dataEntit1.value.length + dataEntit2.value.length;
                                this.getView().byId("numericCont1").setValue(Total.toString());
                            }.bind(this),
                            error: function (errorEntit2) {
                                console.log("Fehler bei der Abfrage von Entität 2:", errorEntit2);
                            }
                        });
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });
            },
            onNavButtonPressed: function () {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
            },
            onNavToAUDMART: function () {
                this.getRouter().navTo("RouteAUDMART");
            },
            /* onNavToAUMPVDM: function () {
                this.getRouter().navTo("RouteAUMPVDM");                
            }, */
            onNavToHAUPARZL: function () {
                this.getRouter().navTo("RouteHAUPARZL");
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            /* getTotalCount: function() {
                return entities && entities.length || 0;
            } */
        });
    });

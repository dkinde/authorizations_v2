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
                var Total,
                    Total1,
                    oModel = this.getOwnerComponent().getModel(),
                    sPathDatamrt = "/AUDMART",
                    sPathProvider = "/AUMPVDM",
                    sUrl1 = oModel.sServiceUrl + sPathDatamrt + "/$count",
                    sUrl2 = oModel.sServiceUrl + sPathProvider + "/$count";

                $.ajax({
                    url: sUrl1,
                    method: "GET",
                    success: function (iTotalEntradas) {
                        console.log("Total: " + Total);
                        console.log("Total de entradas: " + iTotalEntradas);
                        Total = parseInt(iTotalEntradas, 10);
                        console.log("Total: " + Total);
                    },
                    error: function (oError) {
                        console.log("Error al obtener el total de entradas:", oError);
                    }
                });
                $.ajax({
                    url: sUrl2,
                    method: "GET",
                    success: function (iTotalEntradas) {
                        Total1 = parseInt(iTotalEntradas, 10);
                        console.log("Total1: " + Total1);
                        console.log("Total de entradas: " + iTotalEntradas);
                        Total1 = Total + Total1;
                        console.log("Total1: " + Total1);
                    },
                    error: function (oError) {
                        console.log("Error al obtener el total de entradas:", oError);
                    }
                });
                console.log("Total: " + Total);
                console.log("Total1: " + Total1);
                Total = Total + Total1;
                console.log("Total: " + Total1);

                //this.byId("n1").setValue(Total);
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

            /*onNavToWizard: function() {
                this.getRouter().navTo("Wizard1");
            }*/
        });
    });

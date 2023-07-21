sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,UIComponent) {
        "use strict";

        return Controller.extend("authorization.controller.BasisKonfig", {
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de"); 
                sap.ui.getCore().applyChanges();                 
            },
            onNavButtonPressed: function() {
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
            getEntityCount: function(entities) {
                return entities && entities.length || 0;
            }

		    /*onNavToWizard: function() {
                this.getRouter().navTo("Wizard1");
		    }*/
        });
    });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,UIComponent) {
        "use strict";

        return Controller.extend("authorization.controller.Funktion", {
            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("de"); 
                sap.ui.getCore().applyChanges(); 
            },
            onNavButtonPressed: function() {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
             },  
            onNavToHAUFW001: function () {
                this.getRouter().navTo("RouteHAUFW001");                                
            },            
            onNavToHAUPF001: function () {
                this.getRouter().navTo("RouteHAUPF001");                                
            },
            getRouter: function () {
                return this.getOwnerComponent().getRouter();
            },
            getEntityCount: function(entities) {
                return entities && entities.length || 0;
            }
        });
    });

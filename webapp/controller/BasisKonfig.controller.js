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
                var Total = 1,
                    Total1 = "0",
                    oModel = this.getOwnerComponent().getModel(),
                    sPathDatamrt = "/AUDMART",
                    sPathProvider = "/AUMPVDM",
                    sUrl1 = oModel.sServiceUrl + sPathDatamrt,
                    sUrl2 = oModel.sServiceUrl + sPathProvider + "/$count";

                /*  function getTotal() {
                      return new Promise(function (resolve, reject) {
                          $.ajax({
                              url: sUrl1,
                              method: "GET",
                              success: function (iTotalEntradas) {
                                  var totalTemp = parseInt(iTotalEntradas, 10);
                                  console.log("totalTemp: " + totalTemp);
                                  //Total = totalTemp + Total;
                                  //console.log("Total: " + Total);
                                  resolve(totalTemp);
                              },
                              error: function (oError) {
                                  reject(oError);
                                  console.log("Error al obtener el total de entradas:", oError);
                              }
                          });
                      });
                  }
  
                  getTotal().then(function (totalTemp) {
                      Total1 = totalTemp + Total;
                      console.log("Total1: " + Total1);
                      //Total = Total1.toString();
                      this.byId("numericCont1").setValue(Total1);
  
                  }).catch(function (error) {
                      console.log("Error:", error);
                  });
                  console.log("Total1: " + Total1);
                  this.byId("numericCont1").setValue("56");
  
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
                  console.log("Total1: " + Total1);
                  Total = Total + Total1;
                  console.log("Total: " + Total1);
                  Total = Total1.toString();
  
                  this.byId("n1").setValue(Total); 
                  console.log("Total: " + Total);*/

                console.log(oModel);
                var oBinding = oModel.bindList("/Provider"),
                    len = oBinding.getLength();

                console.log("oBinding: " + oBinding);
                console.log("len: " + len);
                this.getView().byId("numericCont1").setValue(len.toString());

                /* console.log(oModel);
                fetch("/AUDMART").then(response => response.json()).then(dataEntidad1 => {
                        var aEntidad1 = dataEntidad1.value;

                        // Consulta a la segunda entidad (Entidad2)
                        fetch("/AUMPVDM").then(response => response.json()).then(dataEntidad2 => {
                                var aEntidad2 = dataEntidad2.value;

                                // Calcular la suma total de los datos de ambas entidades
                                var sumaTotal = 0;
                                aEntidad1.forEach(function (oEntidad1) {
                                    sumaTotal += oEntidad1.Total; // Ajusta el campo Total según la estructura de tu entidad
                                });
                                aEntidad2.forEach(function (oEntidad2) {
                                    sumaTotal += oEntidad2.Total; // Ajusta el campo Total según la estructura de tu entidad
                                });

                                // Obtener referencia al control sap.m.NumericContent
                                var oNumericContent = this.getView().byId("numericCont1"); // Reemplaza con el ID correcto

                                // Establecer el valor de la suma total en sap.m.NumericContent
                                oNumericContent.setValue(sumaTotal.toString());
                                console.log(sumaTotal);
                            })
                            .catch(error => {
                                console.log("Error al consultar la entidad 2:", error);
                            });
                    }).catch(error => {
                        console.log("Error al consultar la entidad 1:", error);
                    }); */

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

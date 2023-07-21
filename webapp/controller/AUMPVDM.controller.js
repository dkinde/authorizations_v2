sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet"    
], function(Controller,
	UIComponent,	
	ODataModel,
	JSONModel,
	Sorter,
	Filter,
	FilterOperator,
	FilterType,
	Fragment,
	MessageToast,
	MessageBox,
	Spreadsheet
	) {
   "use strict";   

   return Controller.extend("authorization.controller.AUMPVDM", {
        onInit: function () {
           this._oModel = this.getOwnerComponent().getModel();
           this._mViewSettingsDialogs = {};
           this.mGroupFunctions = {};
           sap.ui.getCore().getConfiguration().setLanguage("de"); 
           this.oTable = this.byId("table1");
           
        },
        onNavButtonPressed: function() {
           var oRouter = UIComponent.getRouterFor(this);
           oRouter.navTo("RouteBasisKonfig");
        },      
        onCloseViewDialog: function() {	            
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Action cancelled");        
            this.oDialog.close();
		},
        onCloseEditDialog: function() {	
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Action cancelled");               
            this.oDialogEdit.close();
		}, 
        onOpenDialog: function() {
            if (!this._oDialogCRUD) {
				this._oDialogCRUD = this.loadFragment({
					name: "authorization.fragment.InputFields",
                    controller: this
				});
			} 
			this._oDialogCRUD.then(function(oDialog) {                
                this.oDialog = oDialog;
                this.oDialog.open();
			}.bind(this));
		},
        onCreatePress: function () {
            var oNewEntry = {},
                oView = this.getView(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element erfolgreich erstellt");
                    var oList = this.byId("table1");
                    oList.getItems().some(function (oItem) {
                        if (oItem.getBindingContext() === oContext) {
                            oItem.focus();
                            oItem.setSelected(true);
                            return true;
                        }
                    });
                }.bind(this),
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                }.bind(this);
            
            oNewEntry.InfoAuthName = this.getView().byId("__inputCRUD0").getValue();
			oNewEntry.NameCube     = this.getView().byId("__inputCRUD1").getValue();
            oNewEntry.InfoName     = this.getView().byId("__inputCRUD2").getValue();
			oNewEntry.InfoTyp      = this.getView().byId("__inputCRUD3").getValue();
			oNewEntry.Sequenz      = this.getView().byId("__inputCRUD4").getValue();			

            var oContext = this.byId("table1").getBinding("items").create({
                    InfoAuthName: oNewEntry.InfoAuthName, 
                    NameCube:     oNewEntry.NameCube,
                    InfoTyp:      oNewEntry.InfoTyp,
                    Sequenz:      oNewEntry.Sequenz,
                    InfoName:     oNewEntry.InfoName 
                });     
                
            oContext.created().then(fnSucces, fnError).catch(function (oError) {
                if (!oError.canceled) {
                    throw oError;
                }
            });
            this._oModel.submitBatch("$auto").then(fnSucces, fnError);
           
            this.byId("table1").getBinding("items").refresh();       
            this.byId("dialog1").close();            
        },
        createValidation: function () {
                var sInput1 = this.byId("__inputCRUD0").getValue(),
					sInput2 = this.byId("__inputCRUD1").getValue(),
					sInput3 = this.byId("__inputCRUD2").getValue(),
					iInput4 = this.byId("__inputCRUD3").getValue(),
					iInput5 = this.byId("__inputCRUD4").getValue(),
					oInput1 = this.byId("__inputCRUD0"),
					oInput2 = this.byId("__inputCRUD1"),
					oInput3 = this.byId("__inputCRUD2"),
					oInput4 = this.byId("__inputCRUD3"),
					oInput5 = this.byId("__inputCRUD4")
					;
                    
            // validation single inputs	
			if (isNaN(sInput1) && sInput1.length < 50) {				
				//this._oWizard.setCurrentStep(this.byId("step1"));				                
				oInput1.setValueState(sap.ui.core.ValueState.None);
			} else {				
				oInput1.setValueState(sap.ui.core.ValueState.Error);
			}			
			if (isNaN(sInput2) && sInput2.length < 30) {
				oInput2.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInput2.setValueState(sap.ui.core.ValueState.Error);
			}
			if (isNaN(sInput3) && sInput3.length < 30) {
				oInput3.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInput3.setValueState(sap.ui.core.ValueState.Error);
			}
			if (iInput4.length < 3 && iInput4.length > 0) {
				oInput4.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInput4.setValueState(sap.ui.core.ValueState.Error);
			}
			if (iInput5.length == 1) {
				oInput5.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInput5.setValueState(sap.ui.core.ValueState.Error);
			}

			// validation all inputs - next button
			if (isNaN(sInput1) && sInput1.length < 50 && isNaN(sInput2) && sInput2.length < 30 && isNaN(sInput3) && iInput4.length < 3 && iInput4.length > 0 && iInput5.length == 1) {
				this.byId("createButton").setVisible(true);
			} else {
				this.byId("createButton").setVisible(false);	
			}

        },
        onUpdateEditPress: function () {
            var oUpdateEntry = {},
                oModel = this.getView().getModel(),                
                oContext = this.byId("table1").getSelectedItem().getBindingContext(),
                sPath = oContext.getPath(),
                fnSucces = function () {
                    this._setBusy(false);
                    sap.m.MessageToast.show("Object updated successfully");
                    var oList = this.byId("table1");
                    oList.getItems().some(function (oItem) {
                        if (oItem.getBindingContext() === oContext) {
                            oItem.focus();
                            oItem.setSelected(true);
                            return true;
                        }
                    });
                    this._setUIChanges(false);
                }.bind(this),
                fnError = function (oError) {
                    this._setBusy(false);
                    sap.m.MessageBox.error(oError.message);
                    this._setUIChanges(false);
                }.bind(this),
                iIndex = oContext.getIndex();

            oUpdateEntry.InfoAuthName = this.getView().byId("__editCRUD0").getValue();
            oUpdateEntry.NameCube     = this.getView().byId("__editCRUD1").getValue();
            oUpdateEntry.InfoName     = this.getView().byId("__editCRUD2").getValue();
            oUpdateEntry.InfoTyp      = this.getView().byId("__editCRUD3").getValue();
            oUpdateEntry.Sequenz      = this.getView().byId("__editCRUD4").getValue();
                        
            console.log(sPath);
            console.log(this.byId("table1").getSelectedItem());            

            console.log(oContext);
            //oContext.getProperty(sPath);

            console.log(oContext.getProperty("Sequenz"));
            // console.log(oContext.getIndex());           

            //this._setBusy(true);

            //oContext.setProperty("InfoAuthName",oUpdateEntry.InfoAuthName,"$auto",false);     
            //oContext.setProperty("NameCube",oUpdateEntry.NameCube,"$auto",false);
            //oContext.setProperty("InfoName",oUpdateEntry.InfoName,"$auto",false);
            //oContext.setProperty("InfoTyp",oUpdateEntry.InfoTyp,"$auto",false);
            //oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,"$auto",false);  

            //oContext.requestProperty("Sequenz").then(oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,)) ;
            
            oContext.setProperty("Sequenz",oUpdateEntry.Sequenz);
            this._oModel.submitChanges();
            
            //this._setBusy(false);
            //oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));
            //console.log(oContext.getProperty("Sequenz"));          
            //this._bTechnicalErrors = false;
            
            //this.byId("table1").getBinding("items").refresh();  
            //console.log(oContext.getPendingChanges());

            if (oContext.hasPendingChanges()) {
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                sap.m.MessageToast.show("cannot be updated due to pending changes");
            }
            else {                
                //this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                oContext.refresh();
                this.byId("dialog2").close();     
            }

            console.log(oContext.hasPendingChanges());
            console.log(oContext.getProperty("Sequenz"));

            //this._oModel.resetChanges();                                    
            //var oContext = this.byId("table1").getBinding("items").update();
            
        },
        onUpdatePress: function () {            
            var oSelectedItem = this.byId("table1").getSelectedItem();                
    
            if (oSelectedItem) {
                var oView = this.getView(),
                    oContext = oSelectedItem.getBindingContext(),                    
                    oEntry = oContext.getObject();  
                if (!this._oDialogEdit) {                    
                    this._oDialogEdit = this.loadFragment({                        
                        name: "authorization.fragment.EditDialog",
                        controller: this
                    });
                }
                this._oDialogEdit.then(function (oDialog) {                    
                    this.oDialogEdit = oDialog;
                    oView.addDependent(this.oDialogEdit);    
                    this.oDialogEdit.bindElement({
                        path: '/HAUPARZL'
                    });                             
                    this.oDialogEdit.open();                     

                    this.byId("__editCRUD0").setValue(oEntry.InfoAuthName);
                    this.byId("__editCRUD1").setValue(oEntry.NameCube);
                    this.byId("__editCRUD2").setValue(oEntry.InfoName);
                    this.byId("__editCRUD3").setValue(oEntry.InfoTyp);
                    this.byId("__editCRUD4").setValue(oEntry.Sequenz);
                        
                }.bind(this));
                                                                                           
            } else {
                // No se seleccionó ningún elemento
                //sap.m.MessageToast.show("Es wurde kein Element zur Aktualisierung ausgewählt");
                sap.m.MessageBox.warning("Es wurde kein Element zur Aktualisierung ausgewählt");
                console.error("Es wurde kein Element zur Aktualisierung ausgewählt");
            }
        },
        onDeletePress: function () {            
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element deleted ("+ sInfoAuthName +") successfully");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };
            
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sInfoAuthName = oContext.getProperty("InfoAuthName");

                oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));
                
            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
                console.error("Not selected element");
            }  
        },
        onSearch : function (oEvent) {
			var aFilters = [],
                sQuery = oEvent.getSource().getValue();				

            if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("NameCube", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("InfoName", sap.ui.model.FilterOperator.Contains, sQuery)
                ],false);
                aFilters.push(filter);               
            }                                   
            this.byId("table1").getBinding("items").filter(aFilters,sap.ui.model.FilterType.Application);

		},
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
            if (!pDialog) {
                pDialog = sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {                   
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },
        resetGroupDialog: function (oEvent) {
            this.groupReset = true;
        },
        handleSortButtonPressed: function () {
			this.getViewSettingsDialog("authorization.fragment.SortDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},
		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("authorization.fragment.FilterDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},
		handleGroupButtonPressed: function () {
			this.getViewSettingsDialog("authorization.fragment.GroupDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath = mParams.sortItem.getKey(),                
                bDescending = mParams.sortDescending,
                aSorters = [];
                
            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));          
            this.byId("table1").getBinding("items").sort(aSorters);            
        },
        handleFilterDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                aFilters = [];                   
            
                mParams.filterItems.forEach(function (oItem) {
                    console.log(oItem);
                    var aSplit = oItem.getKey().split("___"),
                        sPath = aSplit[0],
                        sValue = aSplit[1],
                        oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                    aFilters.push(oFilter);
                });
                this.byId("table1").getBinding("items").filter(aFilters,sap.ui.model.FilterType.Application);
            
        },
        handleGroupDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,                
                bDescending,
                vGroup,
                aGroups = [];               

            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];
                aGroups.push(new sap.ui.model.Sorter(sPath,bDescending, vGroup));

                this.byId("table1").getBinding("items").sort(aGroups);

            } else if (this.groupReset) {
                this.byId("table1").getBinding("items").sort();
                this.groupReset = false;
            }
        },
        createColumnConfig: function() {
			var aCols = [];

            aCols.push({
				property: 'InfoAuthName',
				type: sap.ui.export.EdmType.String
			});
            aCols.push({
				property: 'NameCube',
				type: sap.ui.export.EdmType.String
			});
            aCols.push({
				property: 'InfoName',
				type: sap.ui.export.EdmType.String
			});
            aCols.push({
				property: 'InfoTyp',
				type: sap.ui.export.EdmType.Number
			});
            aCols.push({
				property: 'Sequenz',
				type: sap.ui.export.EdmType.Number
			});

			return aCols;
		},
        onExport: function() {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable){
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export sample.xlsx',
                worker: false
            };

            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

        onRefresh : function () {
			var oBinding = this.byId("table1").getBinding("items");

			if (oBinding.hasPendingChanges()) {
				sap.m.MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			sap.m.MessageToast.show(this._getText("refreshSuccessMessage"));
		},
        _getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},
        _setUIChanges : function (bHasUIChanges) {
			if (this._bTechnicalErrors) {
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}

			var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/hasUIChanges", bHasUIChanges);
            //var oModel = this._oModel.setProperty("/hasUIChanges", bHasUIChanges);
		},
        _setBusy : function (bIsBusy) {
			//var oModel = this._oModel.setProperty("/busy", bIsBusy);
            //var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/busy", bIsBusy);
            var oView = this.getView().setBusy(bIsBusy);
		}
   });
});
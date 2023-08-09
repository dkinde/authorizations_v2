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
], function (Controller,
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

    return Controller.extend("authorization.controller.HAUPF001", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");
        },
        onNavButtonPressed: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteFunktion");
        },
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.getView().byId("__inputCRUD0").setValue("");
            this.getView().byId("__inputCRUD1").setValue("");
            this.oDialog.close();
        },
        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.getView().byId("__editCRUD0").setValue("");
            this.getView().byId("__editCRUD1").setValue("");
            this.oDialogEdit.close();
        },
        onOpenDialog: function () {
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "authorization.fragment.InputFieldsHAUPF001",
                    controller: this
                });
            }
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
            }.bind(this));
        },
        onCreatePress: function () {
            var oNewEntry = {},
                aItems = this.byId("table1").getItems(),
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

            oNewEntry.personalnummer = this.getView().byId("__inputCRUD0").getValue();
            oNewEntry.funktion = this.getView().byId("__inputCRUD1").getValue();

            try {
                for (var i = 0; i < aItems.length; i++) {
                    var oItem = aItems[i],
                        oContext = oItem.getBindingContext(),
                        sPersonalnummer = oContext.getProperty("personalnummer"),
                        sFunktion = oContext.getProperty("funktion");

                    if (sPersonalnummer === oNewEntry.personalnummer &&
                        sFunktion === oNewEntry.funktion) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                }
                var oContext = this.byId("table1").getBinding("items").create({
                    personalnummer: oNewEntry.personalnummer,
                    funktion: oNewEntry.funktion
                });
                oContext.created().then(fnSucces, fnError).catch(function (oError) {
                    if (!oError.canceled) {
                        throw oError;
                    }
                });
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                this.byId("table1").getBinding("items").refresh();
            } catch (error) {
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
            }

            this.getView().byId("__inputCRUD0").setValue("");
            this.getView().byId("__inputCRUD1").setValue("");
            this.byId("dialog1").close();
        },
        createValidation: function () {
            var iInput1 = this.byId("__inputCRUD0").getValue(),
                iInput2 = this.byId("__inputCRUD1").getValue(),
                oInput1 = this.byId("__inputCRUD0"),
                oInput2 = this.byId("__inputCRUD1");

            // validation single inputs	
            if (iInput1.length < 6) {
                //this._oWizard.setCurrentStep(this.byId("step1"));				                
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (iInput2.length < 3) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (iInput1.length < 6 && iInput2.length < 3) {
                this.byId("createButton").setVisible(true);
            } else {
                this.byId("createButton").setVisible(false);
            }
        },
        editValidation: function () {
            var iInput1 = this.byId("__editCRUD0").getValue(),
                iInput2 = this.byId("__editCRUD1").getValue(),
                oInput1 = this.byId("__editCRUD0"),
                oInput2 = this.byId("__editCRUD1");

            // validation single inputs	
            if (iInput1.length < 6 && iInput1.length > 0) {
                //this._oWizard.setCurrentStep(this.byId("step1"));				                
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (iInput2.length < 3 && iInput2.length > 0) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }
            // validation all inputs - next button
            if (iInput1.length < 6 && iInput2.length < 3 && iInput1.length > 0 && iInput2.length > 0) {
                this.byId("editButton").setVisible(true);
            } else {
                this.byId("editButton").setVisible(false);
            }
        },
        onUpdateEditPress: function () {
            var oUpdateEntry = {},
                oModel = this.getView().getModel(),
                oContext = this.byId("table1").getSelectedItem().getBindingContext(),
                sPath = oContext.getPath(),
                sGroupId = oModel.getGroupId(),
                fnSucces = function () {
                    this._setBusy(false);
                    sap.m.MessageToast.show("Objekt erfolgreich aktualisiert");
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

            this._oEditItem = this.byId("table1").getSelectedItem();

            oUpdateEntry.Personalnummer = this.getView().byId("__editCRUD0").getValue();
            oUpdateEntry.Funktion = this.getView().byId("__editCRUD1").getValue();

            //oContext.getProperty(sPath);                       
            //this._setBusy(true);

            //oContext.setProperty("InfoAuthName",oUpdateEntry.InfoAuthName,"$auto",false);     
            //oContext.setProperty("NameCube",oUpdateEntry.NameCube,"$auto",false);
            //oContext.setProperty("InfoName",oUpdateEntry.InfoName,"$auto",false);
            //oContext.setProperty("InfoTyp",oUpdateEntry.InfoTyp,"$auto",false);
            //oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,"$auto",false);  

            //oContext.requestProperty("Sequenz").then(oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,)) ;

            oModel.submitBatch(sGroupId, function () {

                oContext.setProperty("personalnummer", oUpdateEntry.Personalnummer);
                oContext.setProperty("funktion", oUpdateEntry.Funktion);

                oModel.submitBatch(sGroupId).then(fnSucces, fnError);
            }, fnError);

            var sPersonalnummer = oContext.getProperty("personalnummer"),
                sFunktion = oContext.getProperty("funktion");

            if (sPersonalnummer != oUpdateEntry.Personalnummer) {
                oContext.setProperty("personalnummer", oUpdateEntry.Personalnummer);
            }
            if (sFunktion != oUpdateEntry.Funktion) {
                oContext.setProperty("funktion", oUpdateEntry.Funktion);
            }

            oModel.submitBatch(sGroupId).then(fnSucces, fnError);
            //this._oModel.submitChanges();

            //this._setBusy(false);
            //oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));                 
            //this._bTechnicalErrors = false;            
            //this.byId("table1").getBinding("items").refresh();             

            if (oContext.hasPendingChanges()) {
                oModel.submitBatch("$auto").then(fnSucces, fnError);
                sap.m.MessageToast.show("kann aufgrund von anstehenden Änderungen nicht aktualisiert werden");
            }
            else {
                //this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                oContext.refresh();
                this.byId("dialog2").close();
            }

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
                        name: "authorization.fragment.EditDialogHAUPF001",
                        controller: this
                    });
                }
                this._oDialogEdit.then(function (oDialog) {
                    this.oDialogEdit = oDialog;
                    oView.addDependent(this.oDialogEdit);
                    this.oDialogEdit.open();

                    this.byId("__editCRUD0").setValue(oEntry.personalnummer);
                    this.byId("__editCRUD1").setValue(oEntry.funktion);

                }.bind(this));

            } else {
                sap.m.MessageBox.warning("Es wurde kein Element zur Aktualisierung ausgewählt");
            }
        },
        onDeletePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element (" + sPersNummer + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sPersNummer = oContext.getProperty("personalnummer");

                oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));

            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
            }
        },
        onSearch: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, sQuery)
                ], false);
                aFilters.push(filter);
            }
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

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
            this.getViewSettingsDialog("authorization.fragment.SortDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.FilterDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.GroupDialogHAUPF001")
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
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sValue = aSplit[1],
                    oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            });
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

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
                aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

                this.byId("table1").getBinding("items").sort(aGroups);

            } else if (this.groupReset) {
                this.byId("table1").getBinding("items").sort();
                this.groupReset = false;
            }
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                property: 'personalnummer',
                type: sap.ui.export.EdmType.Number
            });
            aCols.push({
                property: 'funktion',
                type: sap.ui.export.EdmType.Number
            });

            return aCols;
        },
        onExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
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
                fileName: 'Table export HAUPF001.xlsx',
                worker: false
            };

            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        onRefresh: function () {
            var oBinding = this.byId("table1").getBinding("items");

            if (oBinding.hasPendingChanges()) {
                sap.m.MessageBox.error(this._getText("refreshNotPossibleMessage"));
                return;
            }
            oBinding.refresh();
            sap.m.MessageToast.show(this._getText("refreshSuccessMessage"));
        },
        _getText: function (sTextId, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
        },
        _setUIChanges: function (bHasUIChanges) {
            if (this._bTechnicalErrors) {
                // If there is currently a technical error, then force 'true'.
                bHasUIChanges = true;
            } else if (bHasUIChanges === undefined) {
                bHasUIChanges = this.getView().getModel().hasPendingChanges();
            }

            var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/hasUIChanges", bHasUIChanges);
        },
        _setBusy: function (bIsBusy) {
            var oView = this.getView().setBusy(bIsBusy);
        }
    });
});
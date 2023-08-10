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

    return Controller.extend("authorization.controller.HAUKB001", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");

        },
        onNavButtonPressed: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome");
        },
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__inputCRUD0").setValue("");
            this.byId("__inputCRUD1").setValue("");
            this.byId("__inputCRUD2").setValue("");
            this.byId("__inputCRUD3").setValue("");
            this.byId("__inputCRUD4").setValue("");
            this.byId("__inputCRUD5").setValue("");
            this.byId("__inputCRUD6").setValue("");
            this.byId("selectTyp").setSelectedKey(null);
            this.oDialog.close();
        },
        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__editCRUD0").setValue("");
            this.byId("__editCRUD1").setValue("");
            this.byId("__editCRUD2").setValue("");
            this.byId("__editCRUD3").setValue("");
            this.byId("__editCRUD4").setValue("");
            this.byId("__editCRUD5").setValue("");
            this.byId("__editCRUD6").setValue("");
            this.byId("selectTyp").setSelectedKey(null);
            this.oDialogEdit.close();
        },
        onOpenDialog: function () {
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "authorization.fragment.InputFieldsHAUKB001",
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
            oNewEntry.datamart = this.getView().byId("__inputCRUD1").getValue();
            oNewEntry.funktion = this.getView().byId("__inputCRUD2").getValue();
            oNewEntry.org_einh = this.getView().byId("__inputCRUD3").getValue();
            oNewEntry.entit = this.getView().byId("__inputCRUD4").getValue();
            oNewEntry.infoobjectkontrolle = this.getView().byId("__inputCRUD5").getValue();
            oNewEntry.wertkontrolle = this.getView().byId("__inputCRUD6").getValue();
            oNewEntry.typ = this.getView().byId("selectTyp").getSelectedItem().getText();

            try {
                for (var i = 0; i < aItems.length; i++) {
                    var oItem = aItems[i],
                        oContext = oItem.getBindingContext(),
                        sPersonalnummer = oContext.getProperty("personalnummer"),
                        sDatamart = oContext.getProperty("datamart"),
                        sFunktion = oContext.getProperty("funktion"),
                        sOrg_einh = oContext.getProperty("org_einh"),
                        sEntit = oContext.getProperty("entit"),
                        sInfoobjectkontrolle = oContext.getProperty("infoobjectkontrolle"),
                        sWertkontrolle = oContext.getProperty("wertkontrolle"),
                        sTyp = oContext.getProperty("typ");

                    if (sPersonalnummer === oNewEntry.personalnummer &&
                        sDatamart === oNewEntry.datamart &&
                        sFunktion === oNewEntry.funktion &&
                        sOrg_einh === oNewEntry.org_einh &&
                        sEntit === oNewEntry.entit &&
                        sInfoobjectkontrolle === oNewEntry.infoobjectkontrolle &&
                        sWertkontrolle === oNewEntry.wertkontrolle &&
                        sTyp === oNewEntry.typ) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                }
                var oContext = this.byId("table1").getBinding("items").create({
                    personalnummer: oNewEntry.personalnummer,
                    datamart: oNewEntry.datamart,
                    funktion: oNewEntry.funktion,
                    org_einh: oNewEntry.org_einh,
                    typ: oNewEntry.typ,
                    entit: oNewEntry.entit,
                    infoobjectkontrolle: oNewEntry.infoobjectkontrolle,
                    wertkontrolle: oNewEntry.wertkontrolle
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
            this.byId("__inputCRUD0").setValue("");
            this.byId("__inputCRUD1").setValue("");
            this.byId("__inputCRUD2").setValue("");
            this.byId("__inputCRUD3").setValue("");
            this.byId("__inputCRUD4").setValue("");
            this.byId("__inputCRUD5").setValue("");
            this.byId("__inputCRUD6").setValue("");
            this.byId("selectTyp").setSelectedKey(null);
            this.byId("dialog1").close();
        },
        createValidation: function () {
            var iInput1 = this.byId("__inputCRUD0").getValue(),
                sInput2 = this.byId("__inputCRUD1").getValue(),
                iInput3 = this.byId("__inputCRUD2").getValue(),
                sInput4 = this.byId("__inputCRUD3").getValue(),
                sInput5 = this.byId("__inputCRUD4").getValue(),
                sInput6 = this.byId("__inputCRUD5").getValue(),
                sInput7 = this.byId("__inputCRUD6").getValue(),
                oInput1 = this.byId("__inputCRUD0"),
                oInput2 = this.byId("__inputCRUD1"),
                oInput3 = this.byId("__inputCRUD2"),
                oInput4 = this.byId("__inputCRUD3"),
                oInput5 = this.byId("__inputCRUD4"),
                oInput6 = this.byId("__inputCRUD5"),
                oInput7 = this.byId("__inputCRUD6");

            // validation single inputs	
            if (iInput1.length < 6 && iInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput2) && sInput2.length < 3) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }
            if (iInput3.length < 3 && iInput3.length > 0) {
                oInput3.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput3.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput4) && sInput4.length < 3) {
                oInput4.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput4.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput5) && sInput5.length < 61) {
                oInput5.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput5.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput6) && sInput6.length < 31) {
                oInput6.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput6.setValueState(sap.ui.core.ValueState.Error);
            }
            if (sInput7.length > 0 && sInput7.length < 61) {
                oInput7.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput7.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (iInput1.length < 6 && iInput1.length > 0 &&
                isNaN(sInput2) && sInput2.length < 3 &&
                iInput3.length < 3 && iInput3.length > 0 &&
                isNaN(sInput4) && sInput4.length < 3 &&
                isNaN(sInput5) && sInput5.length < 61 &&
                isNaN(sInput6) && sInput6.length < 31 &&
                sInput7.length > 0 && sInput7.length < 61) {
                this.byId("createButton").setVisible(true);
            } else {
                this.byId("createButton").setVisible(false);
            }

        },
        editValidation: function () {
            var iInput1 = this.byId("__editCRUD0").getValue(),
                sInput2 = this.byId("__editCRUD1").getValue(),
                iInput3 = this.byId("__editCRUD2").getValue(),
                sInput4 = this.byId("__editCRUD3").getValue(),
                sInput5 = this.byId("__editCRUD4").getValue(),
                sInput6 = this.byId("__editCRUD5").getValue(),
                sInput7 = this.byId("__editCRUD6").getValue(),
                oInput1 = this.byId("__editCRUD0"),
                oInput2 = this.byId("__editCRUD1"),
                oInput3 = this.byId("__editCRUD2"),
                oInput4 = this.byId("__editCRUD3"),
                oInput5 = this.byId("__editCRUD4"),
                oInput6 = this.byId("__editCRUD5"),
                oInput7 = this.byId("__editCRUD6");

            // validation single inputs	
            if (iInput1.length < 6 && iInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput2) && sInput2.length < 3) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }
            if (iInput3.length < 3 && iInput3.length > 0) {
                oInput3.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput3.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput4) && sInput4.length < 3) {
                oInput4.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput4.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput5) && sInput5.length < 61) {
                oInput5.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput5.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput6) && sInput6.length < 31) {
                oInput6.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput6.setValueState(sap.ui.core.ValueState.Error);
            }
            if (sInput7.length > 0 && sInput7.length < 61) {
                oInput7.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput7.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (iInput1.length < 6 && iInput1.length > 0 &&
                isNaN(sInput2) && sInput2.length < 3 &&
                iInput3.length < 3 && iInput3.length > 0 &&
                isNaN(sInput4) && sInput4.length < 3 &&
                isNaN(sInput5) && sInput5.length < 61 &&
                isNaN(sInput6) && sInput6.length < 31 &&
                sInput7.length > 0 && sInput7.length < 61) {
                this.byId("editButton").setVisible(true);
            } else {
                this.byId("editButton").setVisible(false);
            }
        },
        onUpdateEditPress: function () {
            var oUpdateEntry = {},
                oContext = this.byId("table1").getSelectedItem().getBindingContext(),
                sPath = oContext.getPath(),
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

            oUpdateEntry.personalnummer = this.getView().byId("__editCRUD0").getValue();
            oUpdateEntry.datamart = this.getView().byId("__editCRUD1").getValue();
            oUpdateEntry.funktion = this.getView().byId("__editCRUD2").getValue();
            oUpdateEntry.org_einh = this.getView().byId("__editCRUD3").getValue();
            oUpdateEntry.entit = this.getView().byId("__editCRUD4").getValue();
            oUpdateEntry.infoobjectkontrolle = this.getView().byId("__editCRUD5").getValue();
            oUpdateEntry.wertkontrolle = this.getView().byId("__editCRUD6").getValue();
            oUpdateEntry.typ = this.getView().byId("selectTyp").getSelectedItem().getText();

            //this._setBusy(true);

            //oContext.setProperty("InfoAuthName",oUpdateEntry.InfoAuthName,"$auto",false);     
            //oContext.setProperty("NameCube",oUpdateEntry.NameCube,"$auto",false);
            //oContext.setProperty("InfoName",oUpdateEntry.InfoName,"$auto",false);
            //oContext.setProperty("InfoTyp",oUpdateEntry.InfoTyp,"$auto",false);
            //oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,"$auto",false);  

            //oContext.requestProperty("Sequenz").then(oContext.setProperty("Sequenz",oUpdateEntry.Sequenz,)) ;

            oContext.setProperty("Sequenz", oUpdateEntry.Sequenz);
            this._oModel.submitChanges();

            //this._setBusy(false);
            //oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));                    
            //this._bTechnicalErrors = false;

            //this.byId("table1").getBinding("items").refresh();              

            if (oContext.hasPendingChanges()) {
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
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
                        name: "authorization.fragment.EditDialogHAUKB001",
                        controller: this
                    });
                }
                this._oDialogEdit.then(function (oDialog) {
                    this.oDialogEdit = oDialog;
                    oView.addDependent(this.oDialogEdit);
                    this.oDialogEdit.bindElement({
                        path: '/HAUKB001'
                    });
                    this.oDialogEdit.open();
                    this.byId("__editCRUD0").setValue(oEntry.personalnummer);
                    this.byId("__editCRUD1").setValue(oEntry.datamart);
                    this.byId("__editCRUD2").setValue(oEntry.funktion);
                    this.byId("__editCRUD3").setValue(oEntry.org_einh);
                    this.byId("__editCRUD4").setValue(oEntry.entit);
                    this.byId("__editCRUD5").setValue(oEntry.infoobjectkontrolle);
                    this.byId("__editCRUD6").setValue(oEntry.wertkontrolle);
                    //this.byId("selectTyp").setSelectedItem(oEntry.typ).setText();
                    //console.log(oEntry.typ);
                }.bind(this));
            } else {
                sap.m.MessageBox.warning("Es wurde kein Element zur Aktualisierung ausgewählt");
            }
        },
        onDeletePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element (" + sPersonalnummer + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };
            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sPersonalnummer = oContext.getProperty("personalnummer");

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
                    new sap.ui.model.Filter("datamart", sap.ui.model.FilterOperator.EQ, sQuery[0] + sQuery[1]),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, sQuery),
                    new sap.ui.model.Filter("org_einh", sap.ui.model.FilterOperator.EQ, sQuery[0] + sQuery[1] + sQuery[2]),
                    new sap.ui.model.Filter("typ", sap.ui.model.FilterOperator.EQ, sQuery[0]),
                    new sap.ui.model.Filter("entit", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("infoobjectkontrolle", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("wertkontrolle", sap.ui.model.FilterOperator.Contains, sQuery)
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
            console.log("reset");
            this.groupReset = true;
        },
        handleSortButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.SortDialogHAUKB001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.FilterDialogHAUKB001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("authorization.fragment.GroupDialogHAUKB001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sort = oEvent.getParameter("sortItem"),
                aSorters = [];

            if (sort) {
                var sPath = mParams.sortItem.getKey(),
                    bDescending = mParams.sortDescending;

                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                this.byId("sortUsersButton").setType("Emphasized");
            } else
                this.byId("sortUsersButton").setType("Default");

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

            var filters = oEvent.getParameter("filterItems");

            if (filters.length > 0)
                this.byId("filterButton").setType("Emphasized");
            else
                this.byId("filterButton").setType("Default");

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
            console.log(mParams);
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                property: 'personalnummer',
                type: sap.ui.export.EdmType.Number
            });
            aCols.push({
                property: 'datamart',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'funktion',
                type: sap.ui.export.EdmType.Number
            });
            aCols.push({
                property: 'org_einh',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'typ',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'entit',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'infoobjectkontrolle',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'wertkontrolle',
                type: sap.ui.export.EdmType.String
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
                fileName: 'Table export sample.xlsx',
                worker: false
            };

            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        _setUIChanges: function (bHasUIChanges) {
            if (this._bTechnicalErrors) {
                // If there is currently a technical error, then force 'true'.
                bHasUIChanges = true;
            } else if (bHasUIChanges === undefined) {
                bHasUIChanges = this.getView().getModel().hasPendingChanges();
            }

            //var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/hasUIChanges", bHasUIChanges);
            //var oModel = this._oModel.setProperty("/hasUIChanges", bHasUIChanges);
        },
        _setBusy: function (bIsBusy) {
            //var oModel = this._oModel.setProperty("/busy", bIsBusy);
            //var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/busy", bIsBusy);
            var oView = this.getView().setBusy(bIsBusy);
        }
    });
});
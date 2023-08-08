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

    return Controller.extend("authorization.controller.AUDMART", {
        onBeforeRendering: function () {
        },
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");
        },
        onDatamartSelect: function (oEvent) {
            this.byId("table2").setBindingContext(oEvent.getParameters().listItem.getBindingContext());
        },
        onNavButtonPressed: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteBasisKonfig");
        },
        onCloseViewDialog1: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__inputCRUD0").setValue('');
            this.byId("__inputCRUD1").setValue('');
            this.byId("__inputCRUD2").setValue('');
            this.byId("__inputCRUD3").setValue('');
            this.byId("dialog1").close();
        },
        onCloseViewDialog2: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__inputCRUD4").setValue('');
            this.byId("__inputCRUD5").setValue('');
            this.byId("dialog2").close();
        },
        onCloseEditDialog1: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__editCRUD0").setValue('');
            this.byId("__editCRUD1").setValue('');
            this.byId("__editCRUD2").setValue('');
            this.byId("__editCRUD3").setValue('');
            this.byId("dialog3").close();
        },
        onCloseEditDialog2: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__editCRUD4").setValue('');
            this.byId("__editCRUD5").setValue('');
            this.byId("dialog4").close();
        },
        onOpenDialog1: function () {
            if (!this._oDialogCRUD1) {
                this._oDialogCRUD1 = this.loadFragment({
                    name: "authorization.fragment.InputFieldsAUDMART",
                    controller: this
                });
            }
            this._oDialogCRUD1.then(function (oDialog) {
                this.oDialogCRUD1 = oDialog;
                this.getView().addDependent(this.oDialogCRUD1);
                this.oDialogCRUD1.open();
            }.bind(this));
        },
        onOpenDialog2: function () {
            if (!this._oDialogCRUD2) {
                this._oDialogCRUD2 = this.loadFragment({
                    name: "authorization.fragment.InputFieldsAUMPVDM",
                    controller: this
                });
            }
            this._oDialogCRUD2.then(function (oDialog) {
                this.oDialogCRUD2 = oDialog;
                this.getView().addDependent(this.oDialogCRUD2);
                this.oDialogCRUD2.open();
            }.bind(this));
        },
        onCreatePress1: function () {
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

            oNewEntry.datamart = this.getView().byId("__inputCRUD0").getValue();
            oNewEntry.Txtsh = this.getView().byId("__inputCRUD1").getValue();
            oNewEntry.Txtmd = this.getView().byId("__inputCRUD2").getValue();
            oNewEntry.Txtlg = this.getView().byId("__inputCRUD3").getValue();

            try {
                for (var i = 0; i < aItems.length; i++) {
                    var oItem = aItems[i],
                        oContext = oItem.getBindingContext(),
                        sDatamart = oContext.getProperty("datamart"),
                        sTxtsh = oContext.getProperty("Txtsh"),
                        sTxtmd = oContext.getProperty("Txtmd"),
                        sTxtlg = oContext.getProperty("Txtlg");

                    if (sDatamart === oNewEntry.datamart &&
                        sTxtsh === oNewEntry.Txtsh &&
                        sTxtmd === oNewEntry.Txtmd &&
                        sTxtlg === oNewEntry.Txtlg) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                }
                var oContext = this.byId("table1").getBinding("items").create({
                    datamart: oNewEntry.datamart,
                    Txtsh: oNewEntry.Txtsh,
                    Txtmd: oNewEntry.Txtmd,
                    Txtlg: oNewEntry.Txtlg
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

            this.byId("dialog1").close();
            this.byId("__inputCRUD0").setValue('');
            this.byId("__inputCRUD1").setValue('');
            this.byId("__inputCRUD2").setValue('');
            this.byId("__inputCRUD3").setValue('');
        },
        onCreatePress2: function () {
            var oNewEntry = {},
                aItems = this.byId("table2").getItems(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element erfolgreich erstellt");
                    var oList = this.byId("table2");
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

            oNewEntry.datamart = this.getView().byId("__inputCRUD4").getValue();
            oNewEntry.multi = this.getView().byId("__inputCRUD5").getValue();

            try {
                for (var i = 0; i < aItems.length; i++) {
                    var oItem = aItems[i],
                        oContext = oItem.getBindingContext(),
                        sDatamart = oContext.getProperty("datamart"),
                        sMulti = oContext.getProperty("multi");

                    if (sDatamart === oNewEntry.datamart &&
                        sMulti === oNewEntry.multi) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                }
                var oContext = this.byId("table2").getBinding("items").create({
                    datamart: oNewEntry.datamart,
                    multi: oNewEntry.multi
                });
                oContext.created().then(fnSucces, fnError).catch(function (oError) {
                    if (!oError.canceled) {
                        throw oError;
                    }
                });

                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                this.byId("table2").getBinding("items").refresh();

            } catch (error) {
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
            }

            this.byId("dialog2").close();
            this.byId("__inputCRUD4").setValue('');
            this.byId("__inputCRUD5").setValue('');
        },
        createValidation1: function () {
            var sInput1 = this.byId("__inputCRUD0").getValue(),
                sInput2 = this.byId("__inputCRUD1").getValue(),
                sInput3 = this.byId("__inputCRUD2").getValue(),
                sInput4 = this.byId("__inputCRUD3").getValue(),
                oInput1 = this.byId("__inputCRUD0"),
                oInput2 = this.byId("__inputCRUD1"),
                oInput3 = this.byId("__inputCRUD2"),
                oInput4 = this.byId("__inputCRUD3");

            // validation single inputs	
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput2) && sInput2.length < 21 && sInput2.length > 0) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput3) && sInput3.length < 41 && sInput3.length > 0) {
                oInput3.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput3.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput4) && sInput4.length < 61 && sInput4.length > 0) {
                oInput4.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput4.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0 && isNaN(sInput2) && sInput2.length < 21 && sInput2.length > 0 && isNaN(sInput3) && sInput3.length < 41 && sInput3.length > 0 && isNaN(sInput4) && sInput4.length < 61 && sInput4.length > 0) {
                this.byId("createButton1").setVisible(true);
            } else {
                this.byId("createButton1").setVisible(false);
            }

        },
        createValidation2: function () {
            var sInput1 = this.byId("__inputCRUD4").getValue(),
                sInput2 = this.byId("__inputCRUD5").getValue(),
                oInput1 = this.byId("__inputCRUD4"),
                oInput2 = this.byId("__inputCRUD5");

            // validation single inputs	
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput2) && sInput2.length < 31 && sInput2.length > 0) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0 && isNaN(sInput2) && sInput2.length < 31 && sInput2.length > 0) {
                this.byId("createButton2").setVisible(true);
            } else {
                this.byId("createButton2").setVisible(false);
            }

        },
        onUpdateEditPress1: function () {
            var oUpdateEntry = {},
                oModel = this.getView().getModel(),
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
                }.bind(this);

            oUpdateEntry.datamart = this.getView().byId("__editCRUD0").getValue();
            oUpdateEntry.Txtsh = this.getView().byId("__editCRUD1").getValue();
            oUpdateEntry.Txtmd = this.getView().byId("__editCRUD2").getValue();
            oUpdateEntry.Txtlg = this.getView().byId("__editCRUD3").getValue();

            oContext.setProperty("Sequenz", oUpdateEntry.Sequenz);
            this._oModel.submitChanges();

            if (oContext.hasPendingChanges()) {
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                sap.m.MessageToast.show("kann aufgrund von anstehenden Änderungen nicht aktualisiert werden");
            }
            else {
                oContext.refresh();
                this.byId("dialog2").close();
            }

        },
        onUpdateEditPress2: function () {
            var oUpdateEntry = {},
                oContext = this.byId("table2").getSelectedItem().getBindingContext(),
                sPath = oContext.getPath(),
                fnSucces = function () {
                    this._setBusy(false);
                    sap.m.MessageToast.show("Objekt erfolgreich aktualisiert");
                    var oList = this.byId("table2");
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
                }.bind(this);

            oUpdateEntry.datamart = this.getView().byId("__editCRUD4").getValue();
            oUpdateEntry.multi = this.getView().byId("__editCRUD5").getValue();

            oContext.setProperty("Sequenz", oUpdateEntry.Sequenz);
            this._oModel.submitChanges();

            if (oContext.hasPendingChanges()) {
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                sap.m.MessageToast.show("kann aufgrund von anstehenden Änderungen nicht aktualisiert werden");
            }
            else {
                oContext.refresh();
                this.byId("dialog2").close();
            }

            //this._oModel.resetChanges();                                    
            //var oContext = this.byId("table1").getBinding("items").update();

        },
        onUpdatePress1: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem();

            if (oSelectedItem) {
                var oView = this.getView(),
                    oContext = oSelectedItem.getBindingContext(),
                    oEntry = oContext.getObject();
                if (!this._oDialogEdit1) {
                    this._oDialogEdit1 = this.loadFragment({
                        name: "authorization.fragment.EditDialogAUDMART",
                        controller: this
                    });
                }
                this._oDialogEdit1.then(function (oDialog) {
                    this.oDialogEdit1 = oDialog;
                    oView.addDependent(this.oDialogEdit1);
                    this.oDialogEdit1.open();

                    this.byId("__editCRUD0").setValue(oEntry.datamart);
                    this.byId("__editCRUD1").setValue(oEntry.Txtsh);
                    this.byId("__editCRUD2").setValue(oEntry.Txtmd);
                    this.byId("__editCRUD3").setValue(oEntry.Txtlg);

                }.bind(this));

            } else {
                sap.m.MessageBox.warning("Es wurde kein Element zur Aktualisierung ausgewählt");
            }
        },
        onUpdatePress2: function () {
            var oSelectedItem = this.byId("table2").getSelectedItem();

            if (oSelectedItem) {
                var oView = this.getView(),
                    oContext = oSelectedItem.getBindingContext(),
                    oEntry = oContext.getObject();
                if (!this._oDialogEdit2) {
                    this._oDialogEdit2 = this.loadFragment({
                        name: "authorization.fragment.EditDialogAUMPVDM",
                        controller: this
                    });
                }
                this._oDialogEdit2.then(function (oDialog) {
                    this.oDialogEdit2 = oDialog;
                    oView.addDependent(this.oDialogEdit2);
                    this.oDialogEdit2.open();

                    this.byId("__editCRUD4").setValue(oEntry.datamart);
                    this.byId("__editCRUD5").setValue(oEntry.multi);

                }.bind(this));

            } else {
                sap.m.MessageBox.warning("Es wurde kein Element zur Aktualisierung ausgewählt");
            }
        },
        editValidation1: function () {
            var sInput1 = this.byId("__editCRUD0").getValue(),
                sInput2 = this.byId("__editCRUD1").getValue(),
                sInput3 = this.byId("__editCRUD2").getValue(),
                sInput4 = this.byId("__editCRUD3").getValue(),
                oInput1 = this.byId("__editCRUD0"),
                oInput2 = this.byId("__editCRUD1"),
                oInput3 = this.byId("__editCRUD2"),
                oInput4 = this.byId("__editCRUD3");

            // validation single inputs	
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput2) && sInput2.length < 21 && sInput2.length > 0) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput3) && sInput3.length < 41 && sInput3.length > 0) {
                oInput3.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput3.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput4) && sInput4.length < 61 && sInput4.length > 0) {
                oInput4.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput4.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0 && isNaN(sInput2) && sInput2.length < 21 && sInput2.length > 0 && isNaN(sInput3) && sInput3.length < 41 && sInput3.length > 0 && isNaN(sInput4) && sInput4.length < 61 && sInput4.length > 0) {
                this.byId("editButton1").setVisible(true);
            } else {
                this.byId("editButton1").setVisible(false);
            }

        },
        editValidation2: function () {
            var sInput1 = this.byId("__editCRUD4").getValue(),
                sInput2 = this.byId("__editCRUD5").getValue(),
                oInput1 = this.byId("__editCRUD4"),
                oInput2 = this.byId("__editCRUD5");

            // validation single inputs	
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sInput2) && sInput2.length < 31 && sInput2.length > 0) {
                oInput2.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput2.setValueState(sap.ui.core.ValueState.Error);
            }

            // validation all inputs - next button
            if (isNaN(sInput1) && sInput1.length < 3 && sInput1.length > 0 && isNaN(sInput2) && sInput2.length < 31 && sInput2.length > 0) {
                this.byId("editButton2").setVisible(true);
            } else {
                this.byId("editButton2").setVisible(false);
            }

        },
        onDeletePress1: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element (" + sDatamart + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sDatamart = oContext.getProperty("datamart");

                oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));

            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
            }
        },
        onDeletePress2: function () {
            var oSelectedItem = this.byId("table2").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element (" + sDatamart + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sDatamart = oContext.getProperty("datamart");

                oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));

            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
            }
        },
        onSearch1: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {

                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("datamart", sap.ui.model.FilterOperator.Contains, sQuery[0] + sQuery[1]),
                    new sap.ui.model.Filter("Txtsh", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("Txtmd", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("Txtlg", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);
                aFilters.push(filter);
                console.log(aFilters);
                this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
            } else {
                this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
            }

            /* function _createSearchFilters(sSearch) {
                if (sSearch) {
                    var aPaths = ["name", "range", "parent_mountain", "countries"];
                    var aFilters = aPaths.map(function (sPath) {
                        return new Filter({
                            path: sPath,
                            operator: 
                            ilterOperator.Contains,
                            value1: sSearch
                        });
                    });

                    return [new Filter(aFilters, false)];
                }
                return [];
            } */

        },
        onSearch2: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("datamart", sap.ui.model.FilterOperator.Contains, sQuery[0] + sQuery[1]),
                    new sap.ui.model.Filter("multi", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);
                aFilters.push(filter);
            }
            this.byId("table2").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

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
        resetGroupDialog1: function (oEvent) {
            this.groupReset = true;
        },
        resetGroupDialog2: function (oEvent) {
            this.groupReset = true;
        },
        handleSortButtonPressed1: function () {
            this.getViewSettingsDialog("authorization.fragment.SortDialogAUDMART")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortButtonPressed2: function () {
            this.getViewSettingsDialog("authorization.fragment.SortDialogAUMPVDM")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed1: function () {
            this.getViewSettingsDialog("authorization.fragment.FilterDialogAUDMART")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed2: function () {
            this.getViewSettingsDialog("authorization.fragment.FilterDialogAUMPVDM")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed1: function () {
            this.getViewSettingsDialog("authorization.fragment.GroupDialogAUDMART")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed2: function () {
            this.getViewSettingsDialog("authorization.fragment.GroupDialogAUMPVDM")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm1: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath = mParams.sortItem.getKey(),
                bDescending = mParams.sortDescending,
                aSorters = [];

            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            this.byId("table1").getBinding("items").sort(aSorters);
        },
        handleSortDialogConfirm2: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath = mParams.sortItem.getKey(),
                bDescending = mParams.sortDescending,
                aSorters = [];

            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            this.byId("table2").getBinding("items").sort(aSorters);
        },
        handleFilterDialogConfirm1: function (oEvent) {
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
        handleFilterDialogConfirm2: function (oEvent) {
            var mParams = oEvent.getParameters(),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sValue = aSplit[1],
                    oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            });
            this.byId("table2").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

        },
        handleGroupDialogConfirm1: function (oEvent) {
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
        handleGroupDialogConfirm2: function (oEvent) {
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
                this.byId("table2").getBinding("items").sort(aGroups);
            } else if (this.groupReset) {
                this.byId("table2").getBinding("items").sort();
                this.groupReset = false;
            }
        },
        createColumnConfig1: function () {
            var aCols = [];
            aCols.push({
                property: 'datamart',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'Txtsh',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'Txtmd',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'Txtlg',
                type: sap.ui.export.EdmType.String
            });
            return aCols;
        },
        createColumnConfig2: function () {
            var aCols = [];
            aCols.push({
                property: 'datamart',
                type: sap.ui.export.EdmType.String
            });
            aCols.push({
                property: 'multi',
                type: sap.ui.export.EdmType.String
            });
            return aCols;
        },
        onExport1: function () {
            // TODO: Handle exceptions
            var aCols, oRowBinding, oSettings, oSheet, oTable;
            if (!this._oTable) {
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig1();
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export AUDMART.xlsx',
                worker: false
            };
            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        onExport2: function () {
            // TODO: Handle exceptions
            var aCols, oRowBinding, oSettings, oSheet, oTable;
            if (!this._oTable1) {
                this._oTable1 = this.byId("table2");
            }
            oTable = this._oTable1;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig2();
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export AUMPVDM.xlsx',
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

            var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/hasUIChanges", bHasUIChanges);
            //var oModel = this._oModel.setProperty("/hasUIChanges", bHasUIChanges);
        },
        _setBusy: function (bIsBusy) {
            //var oModel = this._oModel.setProperty("/busy", bIsBusy);
            //var oContext = this.byId("table1").getSelectedItem().getBindingContext().setProperty("/busy", bIsBusy);
            var oView = this.getView().setBusy(bIsBusy);
        }
    });
});
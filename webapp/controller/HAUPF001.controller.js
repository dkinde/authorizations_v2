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
    "sap/ui/export/Spreadsheet",
    'sap/m/Token',
    "sap/f/library"
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
    Spreadsheet,
    Token,
    fioriLibrary
) {
    "use strict";

    return Controller.extend("auth.controller.HAUPF001", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");

            this.aValue = [];
            this.aSelectedPersonal = [];
            this.aSelectedFunktion = [];
            this._oPage = this.byId("dynamicPage1");

            var that = this,
                batchSize = 0,
                iSkip = 0;

            function retrieveData() {
                that._oModel.read("/HAUPF001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            that.aValue = that.aValue.concat(oData.results.map(function (item) {
                                return item;
                            }));
                            // that.aValue = that.aValue.concat(oData.results);                            
                        }
                        if (oData.results.length === 5000) {
                            iSkip += 5000;
                            batchSize += 100;
                            retrieveData();
                        } else {
                            var aDistinctItems = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) {
                                    return obj.personalnummer === oItem.personalnummer;
                                })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems1 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.funktion === oItem.funktion; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            aDistinctItems1.sort(function (a, b) {
                                var funktionA = a.funktion.toLowerCase();
                                var funktionB = b.funktion.toLowerCase();

                                if (funktionA < funktionB) {
                                    return -1;
                                }
                                if (funktionA > funktionB) {
                                    return 1;
                                }
                                return 0;
                            });

                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            oDistinctModel.setSizeLimit(2000);

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiFunktion").setModel(oDistinctModel1);

                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                });
            }
            retrieveData();

            this.oFilterBar = this.getView().byId("filterbar");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oTable = this.getView().byId("table1");
            this.applyData = this.applyData.bind(this);
            this.fetchData = this.fetchData.bind(this);
            this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            this.oView = this.getView();
        },
        onNavButtonPressed: function () {
            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
            UIComponent.getRouterFor(this).navTo("RouteFunktion");
        },
        onListItemPress: function (oEvent) {
            /*this.oView.getParent().getParent().setLayout(sap.f.LayoutType.TwoColumnsBeginExpanded); */

            var funktionPath = oEvent.getSource().getBindingContext().getPath(),
                funktion = funktionPath.match(/funktion='(\d+)'/);

            if (funktion && funktion.length > 1) {
                UIComponent.getRouterFor(this).navTo("RouteDetailPersFKT", {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    funktion: funktion[1]
                });
            }
            // const numeroExtraido = funktion[1];                             

            // this.oRouter.getRoute("RouteDetailPersFKT").attachPatternMatched(this._onFunktionMatched, this);
            // this.oRouter.getRoute("RouteMasterPersFKT").attachPatternMatched(this._onFunktionMatched, this);
        },
        fetchData: function () {
            var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                aResult.push({
                    groupName: oFilterItem.getGroupName(),
                    fieldName: oFilterItem.getName(),
                    fieldData: oFilterItem.getControl().getSelectedKeys()
                });

                return aResult;
            }, []);

            return aData;
        },
        applyData: function (aData) {
            aData.forEach(function (oDataObject) {
                var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                oControl.setSelectedKeys(oDataObject.fieldData);
            }, this);
        },
        getFiltersWithValues: function () {
            var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
                    aResult.push(oFilterGroupItem);
                }
                return aResult;
            }, []);
            return aFiltersWithValue;
        },
        onSelectionChange: function (oEvent) {
            this.oFilterBar.fireFilterChange(oEvent);
        },
        onFilterChange: function () {
            this._updateLabelsAndTable();
        },
        onAfterVariantLoad: function () {
            this._updateLabelsAndTable();
        },
        _updateLabelsAndTable: function () {
            this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
            this.oSnappedLabel.setText(this.getFormattedSummaryText());
            this.oTable.setShowOverlay(true);
        },
        getFormattedSummaryText: function () {
            var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

            if (aFiltersWithValues.length === 0) {
                return "No filters active";
            }

            if (aFiltersWithValues.length === 1) {
                return aFiltersWithValues.length + " filter active: " + aFiltersWithValues.join(", ");
            }

            return aFiltersWithValues.length + " filters active: " + aFiltersWithValues.join(", ");
        },
        getFormattedSummaryTextExpanded: function () {
            var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

            if (aFiltersWithValues.length === 0) {
                return "No filters active";
            }

            var sText = aFiltersWithValues.length + " filters active",
                aNonVisibleFiltersWithValues = this.oFilterBar.retrieveNonVisibleFiltersWithValues();

            if (aFiltersWithValues.length === 1) {
                sText = aFiltersWithValues.length + " filter active";
            }

            if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
                sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
            }

            return sText;
        },
        onSearch: function () {
            var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl(),
                    aSelectedKeys = oControl.getSelectedKeys(),
                    aFilters = aSelectedKeys.map(function (sSelectedKey) {
                        return new sap.ui.model.Filter({
                            path: oFilterGroupItem.getName(),
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: sSelectedKey
                        });
                    });
                if (aSelectedKeys.length > 0) {
                    aResult.push(new sap.ui.model.Filter({
                        filters: aFilters,
                        and: false
                    }));
                }
                return aResult;
            }, []);

            this.oTable.getBinding("items").filter(aTableFilters, sap.ui.model.FilterType.Application);
            this.oTable.setShowOverlay(false);
        },
        onOpenDialog: function () {
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "auth.fragment.InputFieldsHAUPF001",
                    controller: this
                });
            }
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
            }.bind(this));
        },
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("multiInputPers").setValue("");
            this.byId("multiInputFunktion").setValue("");
            this.byId("multiInputPers").removeAllTokens();
            this.byId("multiInputFunktion").removeAllTokens();
            this.aSelectedFunktion = [];
            this.aSelectedPersonal = [];
            var aItems = this.byId("table2").getItems();
            for (let i = 1; i < aItems.length; i++) {
                this.byId("table2").removeItem(aItems[i]);
            }
            this.oDialog.close();
        },
        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.getView().byId("__editCRUD0").setValue("");
            this.getView().byId("__editCRUD1").setValue("");
            this.oDialogEdit.close();
        },
        onValueHelpRequestPersonal: function (oEvent) {
            var oView = this.getView(),
                sInputValue = oEvent.getSource().getValue();
            if (!this._pValueHelpDialog1) {
                this._pValueHelpDialog1 = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "auth.fragment.ValueHelpDialogPersonal",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }
            this._pValueHelpDialog1.then(function (oValueHelpDialog) {
                oValueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
                    "personalnummer",
                    sap.ui.model.FilterOperator.Contains,
                    sInputValue
                )]);
                oValueHelpDialog.open();
            }.bind(this));
        },
        onValueHelpRequestFunktion: function (oEvent) {
            var oView = this.getView(),
                sInputValue = oEvent.getSource().getValue();
            if (!this._pValueHelpDialog2) {
                this._pValueHelpDialog2 = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "auth.fragment.ValueHelpDialogFunktion",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }
            this._pValueHelpDialog2.then(function (oValueHelpDialog) {
                oValueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
                    "funktion",
                    sap.ui.model.FilterOperator.Contains,
                    sInputValue
                )]);
                oValueHelpDialog.open();
            }.bind(this));
        },
        onValueHelpDialogClose: function (oEvent) {
            sap.m.MessageToast.show("Aktion abgebrochen");
            oEvent.getSource().getBinding("items").filter([]);
        },
        onSearchPersonal: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
                oFilter = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.StartsWith, sValue),
                oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        suggestPersonalnummer: function (oEvent) {
            var sValue = oEvent.getParameter("suggestValue"),
                oFilter = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.StartsWith, sValue),
                oBinding = oEvent.getSource().getBinding("suggestionItems");
            oBinding.filter([oFilter]);
        },
        onSearchFunktion: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
                oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.StartsWith, sValue),
                oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        suggestFunktion: function (oEvent) {
            var sValue = oEvent.getParameter("suggestValue"),
                oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.StartsWith, sValue),
                oBinding = oEvent.getSource().getBinding("suggestionItems");
            oBinding.filter([oFilter]);
        },
        multiInputPersTokenUpdate: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts"),
                oMultiInput = this.byId("multiInputPers"),
                that = this;

            switch (oEvent.getParameter("type")) {
                case "added":
                    oEvent.getParameter("addedTokens").forEach(oToken => {
                        that.aSelectedPersonal.push({
                            personalnummer: oToken.getText(),
                            Txtmd: ""
                        });
                    }, this);
                    break;
                case "removed":
                    oEvent.getParameter("removedTokens").forEach(oToken => {
                        var indexToRemove = -1,
                            personalnummerToRemove = oToken.getText();
                        that.aSelectedPersonal.forEach((entry, index) => {
                            if (entry.personalnummer === personalnummerToRemove) {
                                indexToRemove = index;
                            }
                        });
                        if (indexToRemove >= 0) {
                            that.aSelectedPersonal.splice(indexToRemove, 1);
                        }
                    }, this);
                    break;
                default:
                    if (aContexts && aContexts.length) {
                        aContexts.forEach(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            oMultiInput.addToken(new sap.m.Token({
                                text: oSelectedObject.personalnummer
                            }));
                            that.aSelectedPersonal.push({
                                personalnummer: oSelectedObject.personalnummer,
                                Txtmd: oSelectedObject.Txtmd
                            });
                        });
                        var selectedValues = "Ausgewählte Personalnummer: " + aContexts.map(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            return oSelectedObject.personalnummer;
                        }).join(", ");
                        sap.m.MessageToast.show(selectedValues);
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    break;
            }
            this.createValidation();
        },
        multiInputFunktionTokenUpdate: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts"),
                oMultiInput = this.byId("multiInputFunktion"),
                that = this;

            switch (oEvent.getParameter("type")) {
                case "added":
                    oEvent.getParameter("addedTokens").forEach(oToken => {
                        that.aSelectedFunktion.push({
                            funktion: oToken.getText(),
                            Txtlg: ""
                        });
                    }, this);
                    break;
                case "removed":
                    oEvent.getParameter("removedTokens").forEach(oToken => {
                        var indexToRemove = -1,
                            funktionToRemove = oToken.getText();
                        that.aSelectedFunktion.forEach((entry, index) => {
                            if (entry.funktion === funktionToRemove) {
                                indexToRemove = index;
                            }
                        });
                        if (indexToRemove >= 0) {
                            that.aSelectedFunktion.splice(indexToRemove, 1);
                        }
                    }, this);
                    break;
                default:
                    if (aContexts && aContexts.length) {
                        aContexts.forEach(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            oMultiInput.addToken(new sap.m.Token({
                                text: oSelectedObject.funktion
                            }));
                            that.aSelectedFunktion.push({
                                funktion: oSelectedObject.funktion,
                                Txtlg: oSelectedObject.Txtlg
                            });
                        });
                        var selectedValues = "Ausgewählte Funktionen: " + aContexts.map(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            return oSelectedObject.funktion;
                        }).join(", ");
                        sap.m.MessageToast.show(selectedValues);
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    break;
            }
            this.createValidation();
        },
        onAddPress2: function () {
            var aTemplate = [],
                aItems = this.byId("table1").getItems(),
                that = this;
            this.aSelectedFunktion.forEach(fkt => {
                that.aSelectedPersonal.forEach(personal => {
                    aTemplate.push({
                        personalnummer: personal.personalnummer,
                        funktion: fkt.funktion
                    });
                });
            });
            try {
                var oTable = this.byId("table2"),
                    bAssigExist = false,
                    aAssigExist = [],
                    aAssigOK = [],
                    aColumnListItems = [];

                aTemplate.forEach((item) => {
                    var bAssigExist1 = false;
                    for (var i = 0; i < aItems.length; i++) {
                        if (item.funktion === aItems[i].getCells()[1].getTitle() &&
                            item.personalnummer === aItems[i].getCells()[0].getTitle()) {
                            bAssigExist = true;
                            bAssigExist1 = true;
                            aAssigExist.push({
                                personalnummer: item.personalnummer,
                                funktion: item.funktion,
                            });
                            break;
                        }
                    }
                    if (!bAssigExist1) {
                        aAssigOK.push({
                            personalnummer: item.personalnummer,
                            funktion: item.funktion
                        });
                    }
                });

                if (bAssigExist) {
                    var sMessage = "Die folgenden Zuordnungen sind bereits vorhanden\n";
                    aAssigExist.forEach(function (item) {
                        sMessage += "Personalnummer: " + item.personalnummer + " => Funktion: " + item.funktion + "\n";
                    });
                    sap.m.MessageBox.warning(sMessage);
                }
                aAssigOK.forEach(function (item) {
                    var oColumnListItem = new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: item.personalnummer }),
                            new sap.m.Text({ text: item.funktion })
                        ]
                    });
                    aColumnListItems.push(oColumnListItem);
                }, this);
                aColumnListItems.forEach(function (oColumnListItem) {
                    oTable.addItem(oColumnListItem);
                });
                sap.m.MessageToast.show("Element erfolgreich hinzugefügt");

                this.byId("multiInputPers").removeAllTokens();
                this.byId("multiInputFunktion").removeAllTokens();
                this.aSelectedFunktion = [];
                this.aSelectedPersonal = [];
                this.createValidation();

            } catch (error) {
                if (error.message == "DuplicatedKey") {
                    sap.m.MessageBox.warning("Ein Element ist bereits vorhanden");
                }
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                }
            }
        },
        onDeletePress2: function () {
            var oSelectedItem = this.byId("table2").getSelectedItem(),
                iIndex = this.byId("table2").indexOfItem(oSelectedItem);

            if (oSelectedItem) {
                if (iIndex == 0) {
                    sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
                }
                else {
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show("Zuordnung erfolgreich gelöscht");
                }
            } else {
                sap.m.MessageBox.warning("Kein Element zum Löschen ausgewählt!");
            }
            this.createValidation();
        },
        createValidation: function () {
            var aItems = this.getView().byId("table2").getItems();
            if (aItems.length > 1) {
                this.byId("createButton").setEnabled(true);
                this.byId("deleteButton2").setEnabled(true);
            } else {
                this.byId("createButton").setEnabled(false);
                this.byId("deleteButton2").setEnabled(false);
            }

            if (this.aSelectedFunktion != '' && this.aSelectedPersonal != '')
                this.byId("addButton2").setEnabled(true);
            else
                this.byId("addButton2").setEnabled(false);
        },
        onCreatePress: function () {
            try {
                var oTable = this.getView().byId("table2"),
                    aItems = oTable.getItems(),
                    aCreate = [],
                    that = this,
                    fnSuccess = function (oData) {
                        sap.m.MessageToast.show("Funktion erfolgreich zugeordnet");
                    }.bind(this),
                    fnError = function (oError) {
                        sap.m.MessageBox.error(oError.message);
                    }.bind(this);

                for (let i = 1; i < aItems.length; i++) {
                    var aRow = [aItems[i].getCells()[0].getText(),
                    aItems[i].getCells()[1].getText()];
                    aCreate.push(aRow);
                }
                aCreate.forEach(item => {
                    that._oModel.create("/HAUPF001", {
                        personalnummer: item[0],
                        funktion: item[1]
                    }, {
                        success: fnSuccess,
                        error: fnError
                    });
                });
                for (var i = aItems.length - 1; i > 0; i--) {
                    oTable.removeItem(aItems[i]);
                }
                this.oDialog.close();
                this.byId("table1").getBinding("items").refresh();
            } catch (error) {
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                }
            }
        },
        editValidation: function () {
            var iInput1 = this.byId("__editCRUD0").getValue(),
                iInput2 = this.byId("__editCRUD1").getValue(),
                oInput1 = this.byId("__editCRUD0"),
                oInput2 = this.byId("__editCRUD1");

            // validation single inputs	
            if (iInput1.length < 6 && iInput1.length > 0) {
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
                        name: "auth.fragment.EditDialogHAUPF001",
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
                fnSuccess = function () {
                    sap.m.MessageToast.show("Personalnummer (" + sPersNummer + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sPersNummer = oContext.getProperty("personalnummer"),
                    sFunktion = oContext.getProperty("funktion"),
                    sURL = "/HAUPF001(personalnummer='" + sPersNummer + "',funktion='" + sFunktion + "')";

                this._oModel.remove(sURL, {
                    success: fnSuccess,
                    error: fnError
                });
            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
            }
        },
        onSearch1: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sQuery)
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
            this.getViewSettingsDialog("auth.fragment.SortDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.FilterDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.GroupDialogHAUPF001")
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
                this.byId("groupButton").setType("Emphasized");

            } else if (this.groupReset) {
                this.byId("table1").getBinding("items").sort();
                this.byId("groupButton").setType("Default");
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
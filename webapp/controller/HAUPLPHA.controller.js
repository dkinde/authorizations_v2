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
    'sap/m/Token',
    "sap/ui/export/Spreadsheet",
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

    return Controller.extend("auth.controller.HAUPLPHA", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");

            this.aValue = [];
            this.aPhase = [];
            this.aPers = [];
            this._oPage = this.byId("dynamicPage1");
            this.aSelectedPersonal = [];
            this.aSelectedPhase = [];

            var that = this,
                batchSize = 0,
                iSkip = 0;

            function retrieveData(sUrl) {
                that._oModel.read(sUrl, {
                    urlParameters: {
                        "$skiptoken": batchSize
                    },
                    success: function (oData, oResponse) {
                        if (oData && oData.results) {
                            that.aValue = that.aValue.concat(oData.results.map(function (item) {
                                return item;
                            }));
                        }
                        if (oData.__next) {
                            batchSize += 100;
                            retrieveData(sUrl);
                        } else {
                            var aDistinctItems = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.personalnummer === oItem.personalnummer; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems1 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.pla_pha === oItem.pla_pha; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            that.aPhase = aDistinctItems1;

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiPla_pha").setModel(oDistinctModel1);

                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                });
            }
            retrieveData("/HAUPLPHA");

            /* function getData() {
                $.ajax({
                    url: that.getOwnerComponent().getModel().sServiceUrl + "/HAUPLPHA" + "?$top=500" + "&$skip=" + iSkip,
                    method: "GET",
                    success: function (data) {
                        if (data && data.value) {
                            that.aValue = that.aValue.concat(data.value.map(function (item) {
                                return item;
                            }));
                        }
                        if (data.value.length === 500) {
                            iSkip += 500;
                            getData();
                        } else {
                            var aDistinctItems = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.personalnummer === oItem.personalnummer; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems1 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.pla_pha === oItem.pla_pha; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            that.aPhase = aDistinctItems1;

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiPla_pha").setModel(oDistinctModel1);

                            that._oPage.setBusy(false);
                            return;
                        }
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });
            }
            getData(); */

            /* this.oSmartVariantManagement = this.getView().byId("svm"); */
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

            /* var oPersInfo = new sap.ui.comp.smartvariants.PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                dataSource: "",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar); */

        },
        onNavButtonPressed: function () {
            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
            UIComponent.getRouterFor(this).navTo("RouteHome");
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
            //this.oSmartVariantManagement.currentVariantSetModified(true);
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
                            operator: sap.ui.model.FilterOperator.Contains,
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
        onSelectForm1: function () {
            this.byId("buttonPers1").setEnabled(true);
            this.byId("selectphase1").setEnabled(true);
            this.byId("buttonPers2").setEnabled(false);
            this.byId("selectphase2").setEnabled(false);
        },
        onSelectForm2: function () {
            this.byId("buttonPers1").setEnabled(false);
            this.byId("selectphase1").setEnabled(false);
            this.byId("buttonPers2").setEnabled(true);
            this.byId("selectphase2").setEnabled(true);
        },
        onValueHelpRequest: function (oEvent) {
            var oView = this.getView(),
                sInputValue = oEvent.getSource().getValue();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "auth.fragment.ValueHelpDialog",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }
            this._pValueHelpDialog.then(function (oValueHelpDialog) {
                // this._configValueHelpDialog();
                oValueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
                    "personalnummer",
                    sap.ui.model.FilterOperator.Contains,
                    sInputValue
                )]);
                oValueHelpDialog.open();
            }.bind(this));
        },
        multiInputPersTokenUpdate: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem"),
                aContexts = oEvent.getParameter("selectedContexts"),
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
                // this.aSelectedPersonal.splice(oEvent.getParameter("removedTokens").getText());                        
                case "S":
                    // oSelect.addItem(new sap.ui.core.Item({ key: "S", text: "S" }));
                    break;
                default:
                    if (aContexts && aContexts.length) {
                        aContexts.forEach(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            oMultiInput.addToken(new Token({
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
            // console.log(this.aSelectedPersonal);
            this.createValidation();

            /* else {
                this.selectedItems = [];
                sap.m.MessageToast.show("keine Personennummern ausgewählt");                
            } */
            /* oEvent.getParameter("addedTokens")
            oEvent.getParameter("removedTokens") */

        },
        onSelectionChange1: function (oEvent) {
            var oSelectDialog = oEvent.getSource(),
                aListItems = oEvent.getParameter("listItems"),
                that = this;
        },
        onValueHelpDialogClose: function (oEvent) {
            sap.m.MessageToast.show("Aktion abgebrochen");
            // console.log(this.aSelectedPersonal);
            oEvent.getSource().getBinding("items").filter([]);
        },
        onValueHelpDialogConfirm: function (oEvent) {
            /* var oSelectedItem = oEvent.getParameter("selectedItem"),
                aContexts = oEvent.getParameter("selectedContexts"),
                oMultiInput = this.byId("multiInputPers"),
                that = this;

            this.selectedItems = [];

            console.log(oSelectedItem);
            if (aContexts && aContexts.length) {
                aContexts.forEach(function (oContext) {
                    var oSelectedObject = oContext.getObject();
                    console.log(oSelectedObject);
                    oMultiInput.addToken(new Token({
                        text: oSelectedObject.personalnummer
                    }));
                    that.selectedItems.push({
                        personalnummer: oSelectedObject.personalnummer,
                        Txtmd: oSelectedObject.Txtmd
                    });
                });
                var selectedValues = "Ausgewählte Personalnummer: " + aContexts.map(function (oContext) {
                    var oSelectedObject = oContext.getObject();
                    return oSelectedObject.personalnummer;
                }).join(", ");
                sap.m.MessageToast.show(selectedValues);
            } else {
                this.selectedItems = [];
                sap.m.MessageToast.show("keine Personennummern ausgewählt");
            }
            oEvent.getSource().getBinding("items").filter([]); */
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
        handleSelectionFinish: function (oEvent) {
            var selectedItems = oEvent.getParameter("selectedItems");

            this.aSelectedPhase = [];
            for (let i = 0; i < selectedItems.length; i++)
                this.aSelectedPhase.push({
                    pla_pha: selectedItems[i].getText()
                });

            // console.log(this.aSelectedPhase);
            /* if (selectedItems.length === aItems.length)
                this.bAlleDatamart = true;
            else
                this.bAlleDatamart = false; */

            this.createValidation();
        },
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("selectphase1").setSelectedKeys(null);
            this.oDialog.close();
        },
        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.oDialogEdit.close();
        },
        onOpenDialog: function () {
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "auth.fragment.InputFieldsHAUPLPHA",
                    controller: this
                });
            }
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
                var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                    distinctItems1: this.aPhase
                });
                this.byId("selectphase1").setModel(oDistinctModel1);
            }.bind(this));

        },
        createValidation: function () {
            var aItems = this.getView().byId("table2").getItems();
            if (aItems.length > 1)
                this.byId("deleteButton2").setEnabled(true);
            else
                this.byId("deleteButton2").setEnabled(false);

            if (this.aSelectedPhase != '' &&
                this.aSelectedPersonal != '')
                this.byId("addButton2").setEnabled(true);
            else
                this.byId("addButton2").setEnabled(false);

            /* var sPersonalNummer = this.getView().byId("selectpersonalnummer").getSelectedKey(),
                sPhase = this.getView().byId("selectphase").getSelectedKey();

            // validation create button
            if (sPersonalNummer && sPhase) {
                this.byId("createButton").setVisible(true);
            } else {
                this.byId("createButton").setVisible(false);
            } */
        },
        onAddPress2: function () {
            var aTemplate = [],
                aItems = this.byId("table1").getItems(),
                that = this;
            this.aSelectedPhase.forEach(phase => {
                that.aSelectedPersonal.forEach(personal => {
                    aTemplate.push({
                        pla_pha: phase.pla_pha,
                        personalnummer: personal.personalnummer
                    });
                });
            });
            console.log(aTemplate);
            try {
                var oTable = this.byId("table2"),
                    bAssigExist = false,
                    aAssigExist = [],
                    aAssigOK = [],
                    aColumnListItems = [];

                aTemplate.forEach((item, index)=>{                    
                    for (var i = 0; i < aItems.length; i++) {
                        if (item.pla_pha === aItems[i].getCells()[0].getTitle() &&
                            item.personalnummer === aItems[i].getCells()[1].getTitle()) {
                            bAssigExist = true;
                            aAssigExist.push({
                                pla_pha: item.pla_pha,
                                personalnummer: item.personalnummer
                            });
                            // aTemplate.splice(index, 1);
                            // sap.m.MessageBox.warning("Diese Element ist vorhanden:\n Phase:" + item.pla_pha + "\n Personalnummer:" + item.personalnummer);
                            // throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");                            
                        } else {
                            aAssigOK.push({
                                pla_pha: item.pla_pha,
                                personalnummer: item.personalnummer
                            });
                        }
                    }                    
                });
                

                console.log(aAssigOK);
                console.log(aAssigExist);

                if (bAssigExist){
                    var sMessage = "Die folgende(n) Personalnummer(n) hat/haben bereits Phase(n) zugeordnet\n";
                    aAssigExist.forEach(function (item){
                        sMessage += "Phase: " + item.pla_pha + " => Personalnummer: " + item.personalnummer + "\n";
                    });
                    sap.m.MessageBox.warning(sMessage);
                } else {
                    
                }
                aAssigOK.forEach(function (item) {
                    var oColumnListItem = new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: item.pla_pha }),
                            new sap.m.Text({ text: item.personalnummer })
                        ]
                    });
                    aColumnListItems.push(oColumnListItem);
                }, this);
                aColumnListItems.forEach(function (oColumnListItem) {
                    oTable.addItem(oColumnListItem);
                });


                /* if (this.byId("__inputFunktion2").getText() == "" ||
                    this.byId("selecttyp").getSelectedKey() == null ||
                    this.byId("selectentit").getSelectedKey() == null ||
                    this.byId("__inputWert").getValue() == "")
                    throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition"); */
                /* this.aIOBJ_Sondern.forEach(element => {
                    if (element[0] == this.byId("__inputFunktion2").getText() &&
                        element[1] == this.byId("selecttyp").getSelectedItem().getText() &&
                        element[2] == this.byId("selectentit").getSelectedItem().getText() &&
                        element[3] == this.byId("__inputWert").getValue()) 
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");                    
                }); */
                // oTable.addItem(oTemplate);
                /* this.aIOBJ_Sondern.push([
                    this.byId("__inputFunktion2").getText(),
                    this.byId("selecttyp").getSelectedItem().getText(),
                    this.byId("selectentit").getSelectedItem().getText(),
                    this.byId("__inputWert").getValue()
                ]); */

                sap.m.MessageToast.show("Element erfolgreich hinzugefügt");

                this.createValidation();
                this.byId("selectphase1").setSelectedKeys(null);
                this.byId("multiInputPers").removeAllTokens();
                this.aSelectedPhase = [];
                this.aSelectedPersonal = [];

            } catch (error) {
                /* if (error.message == "EmptyFieldException")
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden"); */
                if (error.message == "DuplicatedKey") {
                    // sap.m.MessageBox.warning("Diese Element ist vorhanden:\n Phase:" + item.pla_pha + "\n Personalnummer:" + item.personalnummer);
                    sap.m.MessageBox.warning("Ein Element ist bereits vorhanden");
                }
                if (error instanceof TypeError) {
                    console.log(error);
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
                    iIndex -= 1;
                    // this.aIOBJ_Sondern.splice(iIndex, 1);
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show("Zuordnung erfolgreich gelöscht");
                    this.createValidation();
                }
            } else {
                sap.m.MessageBox.warning("Kein Element zum Löschen ausgewählt!");
            }
            this.createValidation();
        },
        onCreatePress: function () {
            var oNewEntry = {},
                aItems = this.byId("table1").getItems(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element erfolgreich erstellt");
                }.bind(this),
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                }.bind(this);

            try {
                oNewEntry.personalnummer = this.getView().byId("selectpersonalnummer").getSelectedItem().getText();
                oNewEntry.pla_pha = this.getView().byId("selectphase").getSelectedItem().getText();

                for (var i = 0; i < aItems.length; i++) {
                    var oItem = aItems[i],
                        oContext = oItem.getBindingContext(),
                        sPersonalnummer = oContext.getProperty("personalnummer"),
                        sPhase = oContext.getProperty("pla_pha");

                    if (sPersonalnummer === oNewEntry.personalnummer &&
                        sPhase === oNewEntry.pla_pha) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                }
                this._oModel.create("/HAUPLPHA", oNewEntry, {
                    success: fnSucces,
                    error: fnError
                });
                this.byId("table1").getBinding("items").refresh();
            } catch (error) {
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                if (error.message === "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
            }

            this.getView().byId("selectpersonalnummer").setSelectedKey(null);
            this.getView().byId("selectphase").setSelectedKey(null);
            this.byId("dialog1").close();
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
                        name: "auth.fragment.EditDialogHAUPLPHA",
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
                    sPersNummer = oContext.getProperty("personalnummer"),
                    sPhase = oContext.getProperty("pla_pha"),
                    sURL = "/HAUPLPHA(personalnummer='" + sPersNummer + "',pla_pha='" + sPhase + "')";
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
                    new sap.ui.model.Filter("pla_pha", sap.ui.model.FilterOperator.Contains, sQuery)
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
            this.getViewSettingsDialog("auth.fragment.SortDialogHAUPLPHA")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.FilterDialogHAUPLPHA")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.GroupDialogHAUPLPHA")
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
                fileName: 'Table export HAUPLPHA.xlsx',
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
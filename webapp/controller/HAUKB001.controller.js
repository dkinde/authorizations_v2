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

    return Controller.extend("auth.controller.HAUKB001", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            sap.ui.getCore().getConfiguration().setLanguage("de");
            this.aValue = [];
            this._oPage = this.byId("dynamicPage1");

            var that = this;
            var iSkip = 0;
            var oModel = this.getOwnerComponent().getModel();

            function getData() {
                oModel.read("/HAUKB001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            that.aValue = that.aValue.concat(oData.results);
                        }
                        console.log(that.aValue.length);
                        if (oData.results.length === 5000) {
                            iSkip += 5000;
                            getData();
                        } else {
                            // Resto del código para procesar los datos
                            // ...
                            console.log(that.aValue);
                            var aDistinctItems = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.personalnummer === oItem.personalnummer; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems1 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.datamart === oItem.datamart; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems2 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.funktion === oItem.funktion; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems3 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.org_einh === oItem.org_einh; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems4 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.typ === oItem.typ; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems5 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.entit === oItem.entit; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems6 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.infoobjectkontrolle === oItem.infoobjectkontrolle; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems7 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.wertkontrolle === oItem.wertkontrolle; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            console.log("distinct 0: "+aDistinctItems.length);
                            console.log("distinct 1: "+aDistinctItems1.length);
                            console.log("distinct 2: "+aDistinctItems2.length);
                            console.log("distinct 3: "+aDistinctItems3.length);
                            console.log("distinct 4: "+aDistinctItems4.length);
                            console.log("distinct 5: "+aDistinctItems5.length);
                            console.log("distinct 6: "+aDistinctItems6.length);
                            console.log("distinct 7: "+aDistinctItems7.length);

                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            var oDistinctModel2 = new sap.ui.model.json.JSONModel({
                                distinctItems2: aDistinctItems2
                            });
                            var oDistinctModel3 = new sap.ui.model.json.JSONModel({
                                distinctItems3: aDistinctItems3
                            });
                            var oDistinctModel4 = new sap.ui.model.json.JSONModel({
                                distinctItems4: aDistinctItems4
                            });
                            var oDistinctModel5 = new sap.ui.model.json.JSONModel({
                                distinctItems5: aDistinctItems5
                            });
                            var oDistinctModel6 = new sap.ui.model.json.JSONModel({
                                distinctItems6: aDistinctItems6
                            });
                            var oDistinctModel7 = new sap.ui.model.json.JSONModel({
                                distinctItems7: aDistinctItems7
                            });

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiDatamart").setModel(oDistinctModel1);
                            that.getView().byId("multiFunktion").setModel(oDistinctModel2);
                            that.getView().byId("multiOrgEinh").setModel(oDistinctModel3);
                            that.getView().byId("multiTyp").setModel(oDistinctModel4);
                            that.getView().byId("multiEntit").setModel(oDistinctModel5);
                            that.getView().byId("multiIOBJK").setModel(oDistinctModel6);
                            that.getView().byId("multiWertK").setModel(oDistinctModel7);

                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });
            }
            getData();

            /* var that = this,
                iSkip = 0;

            function getData() {
                $.ajax({
                    url: that.getOwnerComponent().getModel().sServiceUrl + "/HAUKB001" + "?$top=5000" + "&$skip=" + iSkip,
                    method: "GET",
                    success: function (data) {
                        if (data && data.value) {
                            that.aValue = that.aValue.concat(data.value.map(function (item) {
                                return item;
                            }));
                        }
                        if (data.value.length === 5000) {
                            iSkip += 5000;
                            getData();
                        } else {
                            var aDistinctItems = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.personalnummer === oItem.personalnummer; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems1 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.datamart === oItem.datamart; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems2 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.funktion === oItem.funktion; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems3 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.org_einh === oItem.org_einh; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems4 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.typ === oItem.typ; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems5 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.entit === oItem.entit; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems6 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.infoobjectkontrolle === oItem.infoobjectkontrolle; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems7 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.wertkontrolle === oItem.wertkontrolle; })) {
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
                            var oDistinctModel2 = new sap.ui.model.json.JSONModel({
                                distinctItems2: aDistinctItems2
                            });
                            var oDistinctModel3 = new sap.ui.model.json.JSONModel({
                                distinctItems3: aDistinctItems3
                            });
                            var oDistinctModel4 = new sap.ui.model.json.JSONModel({
                                distinctItems4: aDistinctItems4
                            });
                            var oDistinctModel5 = new sap.ui.model.json.JSONModel({
                                distinctItems5: aDistinctItems5
                            });
                            var oDistinctModel6 = new sap.ui.model.json.JSONModel({
                                distinctItems6: aDistinctItems6
                            });
                            var oDistinctModel7 = new sap.ui.model.json.JSONModel({
                                distinctItems7: aDistinctItems7
                            });

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiDatamart").setModel(oDistinctModel1);
                            that.getView().byId("multiFunktion").setModel(oDistinctModel2);
                            that.getView().byId("multiOrgEinh").setModel(oDistinctModel3);
                            that.getView().byId("multiTyp").setModel(oDistinctModel4);
                            that.getView().byId("multiEntit").setModel(oDistinctModel5);
                            that.getView().byId("multiIOBJK").setModel(oDistinctModel6);
                            that.getView().byId("multiWertK").setModel(oDistinctModel7);

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
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome");
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
        onCancelEntryDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("cleanEntryFilter").setVisible(false);
            this.byId("entryPersonal").setValue("");
            this.byId("entryDatamart").setValue("");
            this.byId("entryFunktion").setValue("");
            this.oDialog.close();
        },
        onCleanEntryFilterPress: function () {
            var aFilters = [];

            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
            this.byId("cleanEntryFilter").setVisible(false);
            sap.m.MessageToast.show("Initialfilter entfernt");

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
        onOpenEntryDialog: function () {
            if (!this._oDialogEntry) {
                this._oDialogEntry = this.loadFragment({
                    name: "authorization.fragment.EntryDialogHAUKB001",
                    controller: this
                });
            }
            this._oDialogEntry.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
            }.bind(this));
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
        onEntryFilterPress: function () {
            var aFilters = [],
                iPersonalnummer = this.byId("entryPersonal").getValue().toString(),
                sDatamart = this.byId("entryDatamart").getValue(),
                iFunktion = this.byId("entryFunktion").getValue().toString(),
                fPersonalnummer = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, iPersonalnummer),
                fDatamart = new sap.ui.model.Filter("datamart", sap.ui.model.FilterOperator.Contains, sDatamart),
                fFunktion = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, iFunktion);

            if (iPersonalnummer) {
                aFilters.push(fPersonalnummer);
            }
            if (sDatamart) {
                aFilters.push(fDatamart);
            }
            if (iFunktion) {
                aFilters.push(fFunktion);
            }

            if (aFilters.length > 0) {
                var combFilter = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: true
                });
                this.byId("table1").getBinding("items").filter(combFilter, sap.ui.model.FilterType.Application);
                this.byId("cleanEntryFilter").setVisible(true);
                console.log(combFilter);
            }

            /* if (iPersonalnummer || sDatamart || iFunktion) {
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, iPersonalnummer),
                    new sap.ui.model.Filter("datamart", sap.ui.model.FilterOperator.Contains, sDatamart),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, iFunktion)
                ], false);                
                aFilters.push(filter);
            }  */

            // this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

            console.log(aFilters);
            console.log(iPersonalnummer);
            console.log(sDatamart);
            console.log(iFunktion);

            sap.m.MessageToast.show("Filter einschalten");
            this.byId("entryPersonal").setValue("");
            this.byId("entryDatamart").setValue("");
            this.byId("entryFunktion").setValue("");
            this.oDialog.close();


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
        entryValidation: function () {
            var iPersonalnummer = this.byId("entryPersonal").getValue(),
                sDatamart = this.byId("entryDatamart").getValue(),
                iFunktion = this.byId("entryFunktion").getValue(),
                oPersonalnummer = this.byId("entryPersonal"),
                oDatamart = this.byId("entryDatamart"),
                oFunktion = this.byId("entryFunktion"),
                flag = false;


            function isValid(input) {
                return isNaN(input) && input.length <= 2;
            }

            if (iPersonalnummer.length > 0 || sDatamart.length > 0 || iFunktion.length > 0) {
                flag = true;
            } else {
                flag = false;
            }

            console.log(flag);
            // validation single inputs
            if (iPersonalnummer.length < 6 && iPersonalnummer.length > 0) {
                oPersonalnummer.setValueState(sap.ui.core.ValueState.None);
            } else {
                oPersonalnummer.setValueState(sap.ui.core.ValueState.Error);
            }
            if (isNaN(sDatamart) && sDatamart.length < 3) {
                oDatamart.setValueState(sap.ui.core.ValueState.None);
            } else {
                oDatamart.setValueState(sap.ui.core.ValueState.Error);
            }
            if (iFunktion.length < 3 && iFunktion.length > 0) {
                oFunktion.setValueState(sap.ui.core.ValueState.None);
            } else {
                oFunktion.setValueState(sap.ui.core.ValueState.Error);
            }

            // Default None state
            if (iPersonalnummer == '') {
                oPersonalnummer.setValueState(sap.ui.core.ValueState.None);
            }
            if (sDatamart == '') {
                oDatamart.setValueState(sap.ui.core.ValueState.None);
            }
            if (iFunktion == '') {
                oFunktion.setValueState(sap.ui.core.ValueState.None);
            }

            // validation all inputs & filter button
            if (flag &&
                ((iPersonalnummer.length <= 5 || !iPersonalnummer) &&
                    (isValid(sDatamart) || !sDatamart) &&
                    (iFunktion.length <= 2 || !iFunktion))) {
                this.byId("entryButton").setType("Emphasized");
            } else {
                this.byId("entryButton").setType("Default");
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
        onSearch1: function (oEvent) {
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

                this.byId("groupButton").setType("Emphasized");

                this.byId("table1").getBinding("items").sort(aGroups);

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
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
    fioriLibrary
) {
    "use strict";

    return Controller.extend("auth.controller.DetailPersFKT", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            /* this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {}; */
            sap.ui.getCore().getConfiguration().setLanguage("de");

            /* this.aValue = [];
            this._oPage = this.byId("dynamicPage1");

            var that = this,
                iSkip = 0;

            function getData() {
                $.ajax({
                    url: that.getOwnerComponent().getModel().sServiceUrl + "/HAUPF001" + "?$top=500" + "&$skip=" + iSkip,
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
                                if (!aUnique.some(function (obj) { return obj.funktion === oItem.funktion; })) {
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

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiFunktion").setModel(oDistinctModel1);

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
            /* this.oFilterBar = this.getView().byId("filterbar");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oTable = this.getView().byId("table1");
            this.applyData = this.applyData.bind(this);
            this.fetchData = this.fetchData.bind(this);
            this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues); */

            /* var oPersInfo = new sap.ui.comp.smartvariants.PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                dataSource: "",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar); */

            this.oView = this.getView();
            this.oRouter = UIComponent.getRouterFor(this);

            this.oRouter.getRoute("RouteDetailPersFKT").attachPatternMatched(this._onFunktionMatched, this);
            //this.oRouter.getRoute("RouteHAUPF001").attachPatternMatched(this._onFunktionMatched, this);

        },
        /* onNavButtonPressed: function () {
            this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
            UIComponent.getRouterFor(this).navTo("RouteFunktion");
        }, */
        onCancelTwoColumns: function () {
            UIComponent.getRouterFor(this).navTo("RouteHAUPF001");
            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
        },
        _onFunktionMatched: function (oEvent) {
            console.log(oEvent.getParameter("arguments"));
            console.log(oEvent.getParameter("arguments").funktion);
            this._funktion = oEvent.getParameter("arguments").funktion || this._funktion || "0";
            console.log(this._funktion);

            var filter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, this._funktion);

            this.byId("funktionTable").getBinding("items").filter(filter, sap.ui.model.FilterType.Application);
            this.byId("funktionTable1").getBinding("items").filter(filter, sap.ui.model.FilterType.Application);

            /* this.getView().bindElement({
                path: "/HAUFW001/" + this._funktion,
                model: this._oModel
            }); */
        },
        onEditToggleButtonPress: function () {
            var oObjectPage = this.getView().byId("ObjectPageLayout"),
                bCurrentShowFooterState = oObjectPage.getShowFooter();

            oObjectPage.setShowFooter(!bCurrentShowFooterState);
        },
        onExit: function () {
            this.oRouter.getRoute("RouteDetailPersFKT").detachPatternMatched(this._onFunktionMatched, this);
            // this.oRouter.getRoute("RouteHAUPF001").detachPatternMatched(this._onFunktionMatched, this);
        },
        /* fetchData: function () {
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
        }, */
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.getView().byId("selectpersonalnummer").setSelectedKey(null);
            this.getView().byId("selectfunktion").setSelectedKey(null);
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

            try {
                oNewEntry.personalnummer = this.getView().byId("selectpersonalnummer").getSelectedItem().getText();
                oNewEntry.funktion = this.getView().byId("selectfunktion").getSelectedItem().getText();

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
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
            }

            this.getView().byId("selectpersonalnummer").setSelectedKey(null);
            this.getView().byId("selectfunktion").setSelectedKey(null);
            this.byId("dialog1").close();
        },
        createValidation: function () {
            var sPersonalNummer = this.getView().byId("selectpersonalnummer").getSelectedKey(),
                sFunktion = this.getView().byId("selectfunktion").getSelectedKey();

            // validation create button
            if (sPersonalNummer && sFunktion) {
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
        }
    });
});
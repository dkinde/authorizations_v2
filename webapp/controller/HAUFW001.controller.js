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

    return Controller.extend("auth.controller.HAUFW001", {
        onInit: function () {
            this._oModel = this.getOwnerComponent().getModel();
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            this.aEntit = [];
            this.aFunktion = [];
            this.maxFunktion = 1;
            this.aNewEntryDatamart = [];
            this.bAlleDatamart = false;
            this.aIOBJ_Sondern = [];

            this.aValue = [];
            this.aEntit = [];
            this.aDefinition = [];

            this._oPage = this.byId("dynamicPage1");

            /* for (let i = 2; i <= 6; i++) {
                this.getView().byId("table" + i).addStyleClass("firstRow");
            } */

            sap.ui.getCore().getConfiguration().setLanguage("de");

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
                                if (!aUnique.some(function (obj) { return obj.funktion === oItem.funktion; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems1 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.typ === oItem.typ; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems2 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.entit === oItem.entit; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems3 = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.wert === oItem.wert; })) {
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

                            that.getView().byId("multiFunktion").setModel(oDistinctModel);
                            that.getView().byId("multiTyp").setModel(oDistinctModel1);
                            that.getView().byId("multiEntit").setModel(oDistinctModel2);
                            that.getView().byId("multiWert").setModel(oDistinctModel3);

                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                });
            }
            retrieveData("/HAUFW001");

            function retrieveEntit(sUrl) {
                that._oModel.read(sUrl, {
                    urlParameters: {
                        "$skiptoken": batchSize
                    },
                    success: function (oData, oResponse) {
                        if (oData && oData.results) {
                            that.aEntit = that.aEntit.concat(oData.results.map(function (item) {
                                return item;
                            }));
                        }
                        if (oData.__next) {
                            batchSize += 100;
                            retrieveData(sUrl);
                        }
                        /* else {

                        } */
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                    }
                });
            }
            retrieveEntit("/ENTITAT");

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
        },
        onExit: function () {
            //Controller.prototype.onExit.apply(this, arguments);
            // var oFilter = [];
            // oSelectedItem = this.byId("table5").getSelectedItem();
            // oSelectedItem.blur();

            this.byId("table1").getBinding("items").filter([], sap.ui.model.FilterType.Application);
        },
        onNavButtonPressed: function () {
            var oFilter = [],
                oSelectedItem = this.byId("table5").getSelectedItem();

            // oSelectedItem.blur();
            this.byId("table1").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteFunktion");
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
        onCloseViewDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("dialog1").setBusy(true);
            this.byId("__inputWert").setValue("");
            this.byId("__inputFunktion1").setText("");
            this.byId("__inputFunktion2").setText("");
            this.byId("comboDatamart").setSelectedKeys(null);
            this.byId("selecttyp").setSelectedKey(null);
            this.byId("selectentit").setSelectedKey(null);

            this.aNewEntryDatamart = [];
            this.aIOBJ_Sondern = [];

            var aItems = this.byId("table2").getItems();
            for (let i = 1; i < aItems.length; i++) {
                this.byId("table2").removeItem(aItems[i]);
            }

            this.oDialog.close();
        },
        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.byId("__inputEditFunktion").setText("");
            // this.byId("__editCRUD2").setValue("");
            this.byId("__editCRUD3").setValue("");
            this.byId("selecttyp1").setSelectedKey(null);
            this.byId("selectentit1").setSelectedKey(null);
            this.aDefinition = [];

            var oTable = this.getView().byId("table6"),
                aItems = oTable.getItems();
            for (var i = aItems.length - 1; i > 0; i--) {
                oTable.removeItem(aItems[i]);
            }

            this.oDialogEdit.close();
        },
        onFunktionPress: function () {
            var oSelectedItem = this.byId("table5").getSelectedItem(),
                oContext = oSelectedItem.getBindingContext(),
                iFunktion = oContext.getProperty("funktion"),
                oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, iFunktion);

            this.byId("table1").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

        },
        onCleanFilter: function () {
            /* var oFilter = [],
                oSelectedItem = this.byId("table5").getSelectedItem(); */
            // oSelectedItem.blur();

            this.byId("table1").getBinding("items").filter([], sap.ui.model.FilterType.Application);
        },
        filterTyp: function () {
            var selTyp = this.byId("selecttyp").getSelectedItem().getText(),
                selEnt = this.byId("selectentit");

            selEnt.removeAllItems();
            this.aEntit.forEach(item => {
                if (item.typ == selTyp) {
                    selEnt.addItem(new sap.ui.core.Item({
                        key: item.entit,
                        text: item.entit
                    }));
                }
            });
            this.getView().byId("selectentit").setSelectedKey(null);
            this.createValidation();
        },
        filterTyp1: function () {
            var selTyp = this.byId("selecttyp1").getSelectedItem().getText(),
                selEnt = this.byId("selectentit1");

            selEnt.removeAllItems();
            this.aEntit.forEach(item => {
                if (item.typ == selTyp) {
                    selEnt.addItem(new sap.ui.core.Item({
                        key: item.entit,
                        text: item.entit
                    }));
                }
            });
            this.getView().byId("selectentit1").setSelectedKey(null);
            this.editValidation();
        },
        onOpenDialog: function () {
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "auth.fragment.InputFieldsHAUFW001",
                    controller: this
                });
            }
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
                this.byId("table2").addStyleClass("firstRow");
            }.bind(this));

            this.maxFunktion = 1;

            var that = this,
                batchSize = 0,
                iSkip = 0;

            /* function getData() {
                $.ajax({
                    url: that.getOwnerComponent().getModel().sServiceUrl + "/HAUFW001" + "?$top=100" + "&$skip=" + iSkip,
                    method: "GET",
                    success: function (data) {
                        if (data && data.value) {
                            that.aFunktion = that.aFunktion.concat(data.value.map(function (item) {
                                return item;
                            }));
                        }
                        if (data.value.length === 100) {
                            iSkip += 100;
                            getData();
                        } else {
                            that.byId("dialog1").setBusy(false);
                            that.aFunktion.forEach(item => {
                                if (item.funktion > that.maxFunktion) {
                                    that.maxFunktion = parseInt(item.funktion, 10);
                                }
                            });
                            that.maxFunktion += 1;
                            that.byId("__inputFunktion1").setText(that.maxFunktion.toString());
                            that.byId("__inputFunktion2").setText(that.byId("__inputFunktion1").getText());
                            return;
                        }
                    }.bind(this),
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                        that.byId("dialog1").setBusy(false);
                    }
                });
            }
            getData(); */

            function getData(sUrl) {
                that._oModel.read(sUrl, {
                    urlParameters: {
                        "$skiptoken": batchSize
                    },
                    success: function (oData, oResponse) {
                        if (oData && oData.results) {
                            that.aFunktion = that.aFunktion.concat(oData.results.map(function (item) {
                                return item;
                            }));
                        }
                        if (oData.__next) {
                            batchSize += 100;
                            getData(sUrl);
                        } else {
                            that.byId("dialog1").setBusy(false);
                            that.aFunktion.forEach(item => {
                                if (item.funktion > that.maxFunktion) {
                                    that.maxFunktion = parseInt(item.funktion, 10);
                                }
                            });
                            that.maxFunktion += 1;
                            that.byId("__inputFunktion1").setText(that.maxFunktion.toString());
                            that.byId("__inputFunktion2").setText(that.byId("__inputFunktion1").getText());
                            return;
                        }
                    },
                    error: function (oError) {
                        console.error("Error al recuperar datos:", oError);
                        that.byId("dialog1").setBusy(false);
                    }
                });
            }
            getData("/HAUFW001");

        },
        handleSelectionFinish: function (oEvent) {
            var selectedItems = oEvent.getParameter("selectedItems"),
                aItems = this.byId("comboDatamart").getItems();

            this.aNewEntryDatamart = [];

            for (let i = 0; i < selectedItems.length; i++)
                this.aNewEntryDatamart.push(selectedItems[i].getText());

            if (selectedItems.length === aItems.length)
                this.bAlleDatamart = true;
            else
                this.bAlleDatamart = false;

            this.createValidation();
        },
        handleSelectionFinish1: function (oEvent) {
            /* var selectedItems = oEvent.getParameter("selectedItems"),
                aItems = this.byId("comboDatamart").getItems();

            this.aNewEntryDatamart = [];

            for (let i = 0; i < selectedItems.length; i++)
                this.aNewEntryDatamart.push(selectedItems[i].getText());

            if (selectedItems.length === aItems.length)
                this.bAlleDatamart = true;
            else
                this.bAlleDatamart = false;

            this.createValidation(); */
        },
        onAddPress2: function () {
            try {
                var oTable = this.byId("table2"),
                    oTemplate = new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: this.byId("__inputFunktion2").getText() }),
                        new sap.m.Text({ text: this.byId("selecttyp").getSelectedItem().getText() }),
                        new sap.m.Text({ text: this.byId("selectentit").getSelectedItem().getText() }),
                        new sap.m.Text({ text: this.byId("__inputWert").getValue() })]
                    });

                if (this.byId("__inputFunktion2").getText() == "" ||
                    this.byId("selecttyp").getSelectedKey() == null ||
                    this.byId("selectentit").getSelectedKey() == null ||
                    this.byId("__inputWert").getValue() == "")
                    throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");

                this.aIOBJ_Sondern.forEach(element => {
                    if (element[0] == this.byId("__inputFunktion2").getText() &&
                        element[1] == this.byId("selecttyp").getSelectedItem().getText() &&
                        element[2] == this.byId("selectentit").getSelectedItem().getText() &&
                        element[3] == this.byId("__inputWert").getValue()) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                });

                oTable.addItem(oTemplate);

                this.aIOBJ_Sondern.push([
                    this.byId("__inputFunktion2").getText(),
                    this.byId("selecttyp").getSelectedItem().getText(),
                    this.byId("selectentit").getSelectedItem().getText(),
                    this.byId("__inputWert").getValue()
                ]);

                sap.m.MessageToast.show("Element erfolgreich hinzugefügt");

                this.createValidation();
                this.byId("selecttyp").setSelectedKey(null);
                this.byId("selectentit").setSelectedKey(null);
                this.byId("__inputWert").setValue("");

            } catch (error) {
                if (error.message == "EmptyFieldException")
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
            }
        },
        onAddPress3: function () {
            try {
                var oTable = this.byId("table6"),
                    oTemplate = new sap.m.ColumnListItem({
                        cells: [new sap.m.Text({ text: this.byId("__inputEditFunktion").getText() }),
                        new sap.m.Text({ text: this.byId("selecttyp1").getSelectedItem().getText() }),
                        new sap.m.Text({ text: this.byId("selectentit1").getSelectedItem().getText() }),
                        new sap.m.Text({ text: this.byId("__editCRUD3").getValue() })]
                    });

                if (this.byId("selecttyp1").getSelectedKey() == null ||
                    this.byId("selectentit1").getSelectedKey() == null ||
                    this.byId("__editCRUD3").getValue() == "")
                    throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");

                if ((this.byId("selecttyp1").getSelectedItem().getText() === "I" ||
                    this.byId("selecttyp1").getSelectedItem().getText() === "S") &&
                    this.byId("__inputEditFunktion").getText() < 5) {
                    throw new sap.ui.base.Exception("OnlyDatamartException", "Falsche Definition");
                }

                var oColumnListItem = new sap.m.ColumnListItem(),
                    oText = new sap.m.Text({ text: this.byId("__inputEditFunktion").getText() }),
                    oSelect = new sap.m.Select({
                        forceSelection: false,
                        selectedKey: this.byId("selecttyp1").getSelectedItem().getText()
                    }),
                    oSelect1 = new sap.m.Select({
                        selectedKey: this.byId("selectentit1").getSelectedItem().getText(),
                        forceSelection: false,
                        change: this.editValidation.bind(this)
                    }),
                    oInput = new sap.m.Input({
                        value: this.byId("__editCRUD3").getValue(),
                        valueLiveUpdate: true,
                        valueStateText: "Geben Sie nicht mehr als 60 Zeichen ein",
                        liveChange: this.editValidation.bind(this)
                    });
                switch (this.byId("selecttyp1").getSelectedItem().getText()) {
                    case "D":
                        oSelect.addItem(new sap.ui.core.Item({ key: "D", text: "D" }));
                        /* var oMultiComboBox = new sap.m.MultiComboBox({
                            showSecondaryValues: true,
                            showSelectAll: true,
                            selectionChange: this.editValidation.bind(this),
                            selectionFinish: this.handleSelectionFinish1.bind(this),
                            width: "500px",
                            items: {
                                path: "/AUDMART",
                                sorter: { path: 'datamart' }
                            }
                        });
                        var oItemTemplate = new sap.ui.core.ListItem({
                            key: "{datamart}",
                            text: "{datamart}",
                            additionalText: "{Txtlg}"
                        });
                        oMultiComboBox.setModel(this._oModel);
                        oMultiComboBox.bindAggregation("items", {
                            path: "/AUDMART",
                            template: oItemTemplate
                        });
                        this.aEntit.forEach(item1 => {
                            if (item1.typ == this.byId("selecttyp1").getSelectedItem().getText()) {
                                oSelect1.addItem(new sap.ui.core.Item({
                                    key: item1.entit,
                                    text: item1.entit
                                }));
                            }
                        });
                        oColumnListItem.addCell(oText);
                        oColumnListItem.addCell(oSelect);
                        oColumnListItem.addCell(oSelect1);
                        oColumnListItem.addCell(oMultiComboBox);
                        oTable.addItem(oColumnListItem); */
                        break;
                    case "I":
                        oSelect.addItem(new sap.ui.core.Item({ key: "I", text: "I" }));
                        /* this.aEntit.forEach(item1 => {
                            if (item1.typ == this.byId("selecttyp1").getSelectedItem().getText()) {
                                oSelect1.addItem(new sap.ui.core.Item({
                                    key: item1.entit,
                                    text: item1.entit
                                }));
                            }
                        });
                        oColumnListItem.addCell(oText);
                        oColumnListItem.addCell(oSelect);
                        oColumnListItem.addCell(oSelect1);
                        oColumnListItem.addCell(oInput);
                        oTable.addItem(oColumnListItem); */
                        break;
                    case "S":
                        oSelect.addItem(new sap.ui.core.Item({ key: "S", text: "S" }));
                        break;
                    default:

                        break;
                }

                this.aEntit.forEach(item1 => {
                    if (item1.typ == this.byId("selecttyp1").getSelectedItem().getText()) {
                        oSelect1.addItem(new sap.ui.core.Item({
                            key: item1.entit,
                            text: item1.entit
                        }));
                    }
                });
                oColumnListItem.addCell(oText);
                oColumnListItem.addCell(oSelect);
                oColumnListItem.addCell(oSelect1);
                oColumnListItem.addCell(oInput);
                oTable.addItem(oColumnListItem);

                /* this.aIOBJ_Sondern.forEach(element => {
                    if (element[0] == this.byId("__inputFunktion2").getText() &&
                        element[1] == this.byId("selecttyp").getSelectedItem().getText() &&
                        element[2] == this.byId("selectentit").getSelectedItem().getText() &&
                        element[3] == this.byId("__inputWert").getValue()) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
                    }
                }); 
                this.aIOBJ_Sondern.push([
                    this.byId("__inputFunktion2").getText(),
                    this.byId("selecttyp").getSelectedItem().getText(),
                    this.byId("selectentit").getSelectedItem().getText(),
                    this.byId("__inputWert").getValue()
                ]); */

                // oTable.addItem(oTemplate);
                sap.m.MessageToast.show("Element erfolgreich hinzugefügt");

                this.editValidation();
                this.byId("selecttyp1").setSelectedKey(null);
                this.byId("selectentit1").setSelectedKey(null);
                this.byId("__editCRUD3").setValue("");

            } catch (error) {
                if (error.message == "EmptyFieldException")
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
                if (error.message == "OnlyDatamartException")
                    sap.m.MessageBox.warning("Nur Datamart kann zu dieser Funktion hinzugefügt werden");
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
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
                    this.aIOBJ_Sondern.splice(iIndex, 1);
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show("Element erfolgreich gelöscht");
                    this.createValidation();
                }
            } else {
                sap.m.MessageBox.warning("Kein Element zum Löschen ausgewählt!");
            }
            this.createValidation();
        },
        onDeletePress3: function () {
            var oSelectedItem = this.byId("table6").getSelectedItem(),
                iIndex = this.byId("table6").indexOfItem(oSelectedItem);

            if (oSelectedItem) {
                if (iIndex == 0) {
                    sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
                }
                else {
                    iIndex -= 1;
                    // this.aIOBJ_Sondern.splice(iIndex, 1);
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show("Element erfolgreich gelöscht");
                    this.editValidation();
                }
            } else {
                sap.m.MessageBox.warning("Kein Element zum Löschen ausgewählt!");
            }
            this.editValidation();
        },
        onCreatePress: function () {
            var oNewEntryDatamart = {},
                oNewEntryTyp = {},
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
                oNewEntryDatamart.funktion = this.getView().byId("__inputFunktion1").getText();
                oNewEntryDatamart.typ = this.getView().byId("__inputTyp1").getText();
                oNewEntryDatamart.entit = this.getView().byId("__inputEntit1").getText();

                if (this.bAlleDatamart) {
                    oNewEntryDatamart.wert = '*';
                    var oContext = this.byId("table1").getBinding("items").create({
                        funktion: oNewEntryDatamart.funktion,
                        typ: oNewEntryDatamart.typ,
                        entit: oNewEntryDatamart.entit,
                        wert: oNewEntryDatamart.wert
                    });
                    oContext.created().then(fnSucces, fnError).catch(function (oError) {
                        if (!oError.canceled) {
                            throw oError;
                        }
                    });
                    this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                } else {
                    this.aNewEntryDatamart.forEach(item => {
                        var oContext = this.byId("table1").getBinding("items").create({
                            funktion: oNewEntryDatamart.funktion,
                            typ: oNewEntryDatamart.typ,
                            entit: oNewEntryDatamart.entit,
                            wert: item
                        });
                        oContext.created().then(fnSucces, fnError).catch(function (oError) {
                            if (!oError.canceled) {
                                throw oError;
                            }
                        });
                        this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                    });
                }

                this.aIOBJ_Sondern.forEach(item => {
                    oNewEntryTyp.funktion = item[0];
                    oNewEntryTyp.typ = item[1];
                    oNewEntryTyp.entit = item[2];
                    oNewEntryTyp.wert = item[3];

                    var oContext = this.byId("table1").getBinding("items").create({
                        funktion: oNewEntryTyp.funktion,
                        typ: oNewEntryTyp.typ,
                        entit: oNewEntryTyp.entit,
                        wert: oNewEntryTyp.wert
                    });
                    oContext.created().then(fnSucces, fnError).catch(function (oError) {
                        if (!oError.canceled) {
                            throw oError;
                        }
                    });
                    this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                });

                this.byId("table1").getBinding("items").refresh();

            } catch (error) {
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning("Das Element ist vorhanden");
            }

            this.byId("__inputFunktion1").setText("");
            this.byId("comboDatamart").setSelectedKeys(null);

            this.byId("__inputFunktion2").setText("");
            this.byId("selecttyp").setSelectedKey(null);
            this.byId("selectentit").setSelectedKey(null);
            this.byId("__inputWert").setValue("");

            this.byId("dialog1").close();
        },
        createValidation: function () {
            var sInput1 = this.byId("__inputWert").getValue(),
                aItems = this.getView().byId("table2").getItems(),
                selectTyp = this.getView().byId("selecttyp").getSelectedKey(),
                selectEntit = this.getView().byId("selectentit").getSelectedKey(),
                oInput1 = this.byId("__inputWert");

            // validation single inputs	            
            if (sInput1.length > 0 && sInput1.length < 61) {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            } else {
                oInput1.setValueState(sap.ui.core.ValueState.Error);
            }

            if (sInput1 == '') {
                oInput1.setValueState(sap.ui.core.ValueState.None);
            }

            if (this.aNewEntryDatamart != '')
                this.byId("addButton2").setEnabled(true);
            else
                this.byId("addButton2").setEnabled(false);

            if (aItems.length > 1)
                this.byId("deleteButton2").setEnabled(true);
            else
                this.byId("deleteButton2").setEnabled(false);


            // validation all inputs - create button
            if (this.aNewEntryDatamart != '' && aItems.length > 1 &&
                selectTyp && selectEntit && sInput1.length > 0 && sInput1.length < 61) {
                this.byId("createButton").setEnabled(true);
            } else {
                this.byId("createButton").setEnabled(false);
            }
        },
        editValidation: function () {
            var sInput1 = this.byId("__editCRUD3").getValue(),
                selectTyp = this.getView().byId("selecttyp1").getSelectedKey(),
                selectEntit = this.getView().byId("selectentit1").getSelectedKey(),
                oInput1 = this.byId("__editCRUD3");

            // validation input
            if (sInput1.length > 0 && sInput1.length < 61)
                oInput1.setValueState(sap.ui.core.ValueState.None);
            else
                oInput1.setValueState(sap.ui.core.ValueState.Error);

            if (sInput1 == '')
                oInput1.setValueState(sap.ui.core.ValueState.None);

            // validation all inputs - edit & add button
            if (selectTyp && selectEntit && sInput1.length > 0 && sInput1.length < 61) {
                // this.byId("editButton").setEnabled(true);
                this.byId("addButton3").setEnabled(true);
            } else {
                // this.byId("editButton").setEnabled(false);
                this.byId("addButton3").setEnabled(false);
            }
        },
        onUpdateEditPress: function () {
            var oUpdateEntry = {},
                bDatamart = false,
                iItems = this.byId("table6").getItems(),
                oContext = this.byId("table1").getSelectedItem().getBindingContext(),
                fnSucces = function () {
                    // this._setBusy(false);
                    sap.m.MessageToast.show("Batch erfolgreich aktualisiert");
                    var oList = this.byId("table1");
                    /* oList.getItems().some(function (oItem) {
                        if (oItem.getBindingContext() === oContext) {
                            oItem.focus();
                            oItem.setSelected(true);
                            return true;
                        }
                    }); */
                    // this._setUIChanges(false);
                }.bind(this),
                fnError = function (oError) {
                    // this._setBusy(false);
                    sap.m.MessageBox.error(oError.message);
                    // this._setUIChanges(false);
                }.bind(this),
                sFunktion = oContext.getProperty("funktion"),
                sEntitat = oContext.getProperty("entit"),
                sTyp = oContext.getProperty("typ"),
                sWert = oContext.getProperty("wert");
            // iIndex = oContext.getIndex();

            console.log(this.byId("table6").getItems());
            for (let i = 1; i < iItems.length; i++) {
                console.log(iItems[i].getCells()[1].getSelectedItem().getText());
                if (iItems[i].getCells()[1].getSelectedItem().getText() === "D") {
                    bDatamart = true;
                    return;
                }
                /* var typ = iItems[i].getCells()[4].getText();
                if (typ >= this.maxTyp)
                    this.maxTyp = parseInt(typ, 10) + 1; */
            }
            if (bDatamart) {

            } else {
                sap.m.MessageBox.warning("Die Funktion, die Sie erstellen möchten, hat keinen Datamart (D)-Typ, der mit ihr verbunden ist");
            }
            // iItems[i].getCells()[4].getText()

            /* if (sEntitat === this.byId("selectentit1").getSelectedItem().getText() &&
                sTyp === this.byId("selecttyp1").getSelectedItem().getText() &&
                sWert === this.byId("__editCRUD3").getValue()) {
                sap.m.MessageBox.warning("Es gibt keine Änderungen zur Aktualisierung der Funktion");
            } else {
                var sURL = "/HAUFW001(funktion='" + sFunktion + "',typ='" + sTyp + "',entit='" + sEntitat + "',wert='" + sWert + "')",
                    that = this;
                // "/HAUFW001(funktion='2',typ='D',entit='DATAMART',wert='DB')"
                oUpdateEntry = {
                    funktion: this.byId("__inputEditFunktion").getText(),
                    typ: this.byId("selecttyp1").getSelectedItem().getText(),
                    entit: this.byId("selectentit1").getSelectedItem().getText(),
                    wert: this.byId("__editCRUD3").getValue()
                };

                console.log(oUpdateEntry);
                console.log(sURL);
                console.log(oContext);
                console.log(this._oModel);

                this._oModel.update(sURL, oUpdateEntry, {                    
                    success: function (data, response) {
                        console.log("funktion aktualisiert!");
                        console.log(response);
                        console.log(data);
                        sap.m.MessageToast.show("Funktion erfolgreich aktualisiert");
                        that._oModel.submitChanges({
                            success: fnSucces,
                            error: fnError
                        });
                        that.byId("dialog2").close();
                        that.byId("table1").getBinding("items").refresh();
                    },
                    error: function (error) {
                        console.error("Error al actualizar el registro: " + error);
                    }
                }); 
            } */

            // this._oModel.submitChanges();
            //this._setBusy(false);
            //oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));
            //this._bTechnicalErrors = false;
            //this.byId("table1").getBinding("items").refresh();

            /* if (oContext.hasPendingChanges()) {
                this._oModel.submitBatch("$auto").then(fnSucces, fnError);
                sap.m.MessageToast.show("Kann aufgrund von anstehenden Änderungen nicht aktualisiert werden");
            }
            else {
                oContext.refresh();
                this.byId("dialog2").close();
            } 
            this._oModel.resetChanges();                                    
            var oContext = this.byId("table1").getBinding("items").update();*/
        },
        onUpdatePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem();
            if (oSelectedItem) {
                var oView = this.getView(),
                    oContext = oSelectedItem.getBindingContext(),
                    oEntry = oContext.getObject();
                if (!this._oDialogEdit) {
                    this._oDialogEdit = this.loadFragment({
                        name: "auth.fragment.EditDialogHAUFW001",
                        controller: this
                    });
                }
                this._oDialogEdit.then(function (oDialog) {
                    this.oDialogEdit = oDialog;
                    oView.addDependent(this.oDialogEdit);
                    this.oDialogEdit.bindElement({
                        path: '/HAUFW001'
                    });
                    this.oDialogEdit.open();
                    // this.byId("table6").addStyleClass("firstRow");
                    var batchSize = 0,
                        that = this;

                    console.log(oEntry.funktion);
                    var oTable = this.byId("table6");

                    oTable.addStyleClass("firstRow");

                    function getFunktion(sUrl) {
                        that._oModel.read(sUrl, {
                            urlParameters: {
                                "$skiptoken": batchSize,
                            },
                            success: function (oData, oResponse) {
                                if (oData && oData.results) {
                                    oData.results.forEach(item => {
                                        if (item.funktion === oEntry.funktion) {
                                            that.aDefinition = that.aDefinition.concat(item);
                                        }
                                    });
                                }
                                if (oData.__next) {
                                    batchSize += 100;
                                    getFunktion(sUrl);
                                }
                                else {
                                    that.aDefinition.forEach(item => {
                                        var oColumnListItem = new sap.m.ColumnListItem(),
                                            oText = new sap.m.Text({ text: item.funktion }),
                                            oSelect = new sap.m.Select({
                                                forceSelection: false,
                                                selectedKey: item.typ
                                            }),
                                            oSelect1 = new sap.m.Select({
                                                selectedKey: item.entit,
                                                forceSelection: false,
                                                change: that.editValidation.bind(that)
                                            }),
                                            oInput = new sap.m.Input({
                                                value: item.wert,
                                                valueLiveUpdate: true,
                                                valueStateText: "Geben Sie nicht mehr als 60 Zeichen ein",
                                                liveChange: that.editValidation.bind(that)
                                            });
                                        switch (item.typ) {
                                            case "D":
                                                oSelect.addItem(new sap.ui.core.Item({ key: "D", text: "D" }));
                                                /* var oItemTemplate = new sap.ui.core.ListItem({
                                                    key: "{datamart}",
                                                    text: "{datamart}",
                                                    additionalText: "{Txtlg}"
                                                }); */
                                                var oMultiComboBox = new sap.m.MultiComboBox({
                                                    showSecondaryValues: true,
                                                    showSelectAll: true,
                                                    selectionChange: that.editValidation.bind(that),
                                                    selectionFinish: that.handleSelectionFinish1.bind(that),
                                                    width: "100px",
                                                    items: {
                                                        path: "/AUDMART",
                                                        sorter: { path: 'datamart' },
                                                        template: new sap.ui.core.ListItem({
                                                            key: "{datamart}",
                                                            text: "{datamart}",
                                                            additionalText: "{Txtlg}"
                                                        })
                                                    }
                                                });
                                                // oMultiComboBox.setModel(that._oModel);
                                                /* oMultiComboBox.bindItems({
                                                    path: "/AUDMART",
                                                    template: oMultiComboBox.getBindingInfo("items").template
                                                }); */
                                                /* oMultiComboBox.bindAggregation("items", {
                                                    path: "/AUDMART",
                                                    template: oItemTemplate
                                                });
                                                oMultiComboBox.addItem(oItemTemplate); */
                                                that.aEntit.forEach(item1 => {
                                                    if (item1.typ == item.typ) {
                                                        oSelect1.addItem(new sap.ui.core.Item({
                                                            key: item1.entit,
                                                            text: item1.entit
                                                        }));
                                                    }
                                                });
                                                if (item.wert === "*") {
                                                    var aItems = oMultiComboBox.getItems();
                                                    console.log(aItems);

                                                    /* addSelectedItem()
                                                    addSelectedKeys() */

                                                    /* aItems.forEach(function (oItem) {
                                                        oItem.setSelectedkeys(true);
                                                    }); */
                                                    // oMultiComboBox.setSelected(true);
                                                } else {
                                                    oMultiComboBox.setSelectedKeys(item.wert);
                                                }
                                                console.log(item.wert);
                                                oColumnListItem.addCell(oText);
                                                oColumnListItem.addCell(oSelect);
                                                oColumnListItem.addCell(oSelect1);
                                                oColumnListItem.addCell(oMultiComboBox);
                                                oTable.addItem(oColumnListItem);
                                                /* var oTable2 = this.byId("table2");
                                                    oTable2.bindItems({
                                                        path: "/AUMPVDM",
                                                        template: oTable2.getBindingInfo("items").template
                                                    }); */
                                                break;
                                            case "I":
                                                oSelect.addItem(new sap.ui.core.Item({ key: "I", text: "I" }));
                                                that.aEntit.forEach(item1 => {
                                                    if (item1.typ == item.typ) {
                                                        oSelect1.addItem(new sap.ui.core.Item({
                                                            key: item1.entit,
                                                            text: item1.entit
                                                        }));
                                                    }
                                                });
                                                oColumnListItem.addCell(oText);
                                                oColumnListItem.addCell(oSelect);
                                                oColumnListItem.addCell(oSelect1);
                                                oColumnListItem.addCell(oInput);
                                                oTable.addItem(oColumnListItem);
                                                break;
                                            case "S":
                                                oSelect.addItem(new sap.ui.core.Item({ key: "S", text: "S" }));
                                                that.aEntit.forEach(item1 => {
                                                    if (item1.typ == item.typ) {
                                                        oSelect1.addItem(new sap.ui.core.Item({
                                                            key: item1.entit,
                                                            text: item1.entit
                                                        }));
                                                    }
                                                });
                                                oColumnListItem.addCell(oText);
                                                oColumnListItem.addCell(oSelect);
                                                oColumnListItem.addCell(oSelect1);
                                                oColumnListItem.addCell(oInput);
                                                oTable.addItem(oColumnListItem);
                                                break;
                                            default:

                                                break;
                                        }
                                        /* that.aEntit.forEach(item1 => {
                                            if (item1.typ == item.typ) {
                                                oSelect1.addItem(new sap.ui.core.Item({
                                                    key: item1.entit,
                                                    text: item1.entit
                                                }));
                                            }
                                        });
                                        oColumnListItem.addCell(oText);
                                        oColumnListItem.addCell(oSelect);
                                        oColumnListItem.addCell(oSelect1);
                                        oColumnListItem.addCell(oInput);
                                        oTable.addItem(oColumnListItem); */
                                    });
                                }
                            },
                            error: function (oError) {
                                console.error("Error al recuperar datos:", oError);
                            }
                        });
                    }
                    getFunktion("/HAUFW001");
                    this.byId("__inputEditFunktion").setText(oEntry.funktion);
                    /*  this.byId("selecttyp1").setSelectedKey(oEntry.typ);
                        this.filterTyp1(); 
                        this.byId("selectentit1").setSelectedKey(oEntry.entit);
                        this.byId("__editCRUD3").setValue(oEntry.wert); */
                    this.editValidation();

                }.bind(this));

            } else {
                sap.m.MessageBox.warning("Es wurde kein Funktion zur Aktualisierung ausgewählt");
            }
        },
        onDeletePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSucces = function () {
                    sap.m.MessageToast.show("Element (" + sFunktion + ") erfolgreich gelöscht");
                },
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sFunktion = oContext.getProperty("funktion");

                // oContext.requestObject().then(oContext.delete("$auto").then(fnSucces, fnError));

            } else {
                sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt");
            }
        },
        onSearch1: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("typ", sap.ui.model.FilterOperator.Contains, sQuery[0]),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("wert", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("entit", sap.ui.model.FilterOperator.Contains, sQuery)
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
            this.getViewSettingsDialog("auth.fragment.SortDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.FilterDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.GroupDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sort = oEvent.getParameter("sortItem"),
                aSorters = [];

            console.log(sort);
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
                property: 'funktion',
                type: sap.ui.export.EdmType.Number
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
                property: 'wert',
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
                fileName: 'Table export HAUFW001.xlsx',
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
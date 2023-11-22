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
        // Initialization function
        onInit: function () {
            // Global variables
            this._oModel = this.getOwnerComponent().getModel();
            this.aEntit = [];
            this.aFunktion = [];
            this.maxFunktion = 1;
            this.aNewEntryDatamart = [];
            this.bAlleDatamart = false;
            this.aIOBJ_Sondern = [];
            this.aValue = [];
            this.aEntit = [];
            this.aDefinition = [];
            this.aDefinitionDelete = [];
            this.aPersNumm = [];
            this.aDatamart = [];
            this.aCreate = [];
            this.aDistinctFunktion = [];
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            this._oPage = this.byId("dynamicPage1");
            this.oFilterBar = this.getView().byId("filterbar");
            this.oTable = this.getView().byId("table1");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.applyData = this.applyData.bind(this);
            this.fetchData = this.fetchData.bind(this);
            this.getFiltersWithValues = this.getFiltersWithValues.bind(this);
            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            // Set App language to German
            sap.ui.getCore().getConfiguration().setLanguage("de");

            // Get Filters Data
            var that = this,
                iSkip = 0,
                iSkip1 = 0;

            function retrieveData() {
                that._oModel.read("/HAUFW001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            // Concatenate data to the 'aValue' array
                            that.aValue = that.aValue.concat(oData.results.map(function (item) {
                                return item;
                            }));
                        }
                        if (oData.results.length === 5000) {
                            iSkip += 5000;
                            // Recursive call to retrieve more data if available
                            retrieveData();
                        } else {
                            // Deduplicate data based on various properties
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

                            // Create JSON models for distinct items
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
                            oDistinctModel.setSizeLimit(500);

                            // Set models for multiComboBoxes in the view
                            that.getView().byId("multiFunktion").setModel(oDistinctModel);
                            that.getView().byId("multiTyp").setModel(oDistinctModel1);
                            that.getView().byId("multiEntit").setModel(oDistinctModel2);
                            that.getView().byId("multiWert").setModel(oDistinctModel3);

                            // Disable busy indicator on the page
                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (oError) {
                        console.error("Fehler beim Abrufen von Daten:", oError);
                    }
                });
            }
            retrieveData();

            function retrieveEntit() {
                that._oModel.read("/ENTITAT", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip1
                    },
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            // Concatenate data to the 'aEntit' array
                            that.aEntit = that.aEntit.concat(oData.results.map(function (item) {
                                return item;
                            }));
                        }
                        if (oData.results.length === 5000) {
                            iSkip1 += 5000;
                            // Recursive call to retrieve more data if available
                            retrieveEntit();
                        }
                    },
                    error: function (oError) {
                        console.error("Fehler beim Abrufen von Daten:", oError);
                    }
                });
            }
            retrieveEntit();
        },
        // This function is called when the controller is being destroyed or exited.
        onExit: function () {
            // Retrieve the binding for the "items" property of the "table1" control
            var tableBinding = this.byId("table1").getBinding("items");

            // Clear any filters applied to the binding for items            
            // It clears the filters and refreshes the binding
            tableBinding.filter([], sap.ui.model.FilterType.Application);
        },
        // Event handler for navigation button press
        onNavButtonPressed: function () {
            var oFilter = [],
                oSelectedItem = this.byId("table5").getSelectedItem();

            // oSelectedItem.blur();
            this.byId("table1").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteFunktion");
        },
        getI18nText: function (key) {
            return this.getView().getModel("i18n").getResourceBundle().getText(key);
        },
        // Function to retrieve filter data from the FilterBar
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
        // Function to apply filter data to the FilterBar
        applyData: function (aData) {
            aData.forEach(function (oDataObject) {
                var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                oControl.setSelectedKeys(oDataObject.fieldData);
            }, this);
        },
        // Function to get filters with selected values from the FilterBar
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
        // Event handler for selection change in the FilterBar
        onSelectionChange: function (oEvent) {
            //this.oSmartVariantManagement.currentVariantSetModified(true);
            this.oFilterBar.fireFilterChange(oEvent);
        },
        // Event handler for filter change in the FilterBar
        onFilterChange: function () {
            this._updateLabelsAndTable();
        },
        // Event handler after loading a variant in the FilterBar
        onAfterVariantLoad: function () {
            this._updateLabelsAndTable();
        },
        // Function to update labels and table after filter changes
        _updateLabelsAndTable: function () {
            this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
            this.oSnappedLabel.setText(this.getFormattedSummaryText());
            this.oTable.setShowOverlay(true);
        },
        // Function to get formatted summary text for the collapsed FilterBar
        getFormattedSummaryText: function () {
            var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

            if (aFiltersWithValues.length === 0) {
                // return "No filters active";
                return this.getI18nText("noFilters");
            }

            if (aFiltersWithValues.length === 1) {
                return aFiltersWithValues.length + " " + this.getI18nText("activeFilter") + " " + aFiltersWithValues.join(", ");
            }

            return aFiltersWithValues.length + " " + this.getI18nText("activeFilters") + " " + aFiltersWithValues.join(", ");
        },
        // Function to get formatted summary text for the expanded FilterBar
        getFormattedSummaryTextExpanded: function () {
            var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

            if (aFiltersWithValues.length === 0) {
                // return "No filters active";
                return this.getI18nText("noFilters");
            }

            var sText = aFiltersWithValues.length + " " + this.getI18nText("activeFilters") + " ",
                aNonVisibleFiltersWithValues = this.oFilterBar.retrieveNonVisibleFiltersWithValues();

            if (aFiltersWithValues.length === 1) {
                sText = aFiltersWithValues.length + " " + this.getI18nText("activeFilter") + " ";
            }

            if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
                sText += " (" + aNonVisibleFiltersWithValues.length + " " + this.getI18nText("hiddenFilter") + ")";
            }

            return sText;
        },
        // Event handler for search action
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
        // This function is triggered when the user presses a button related to a "funktion" in the "table5" control
        onFunktionPress: function () {
            // Get the selected item in the "table5" control
            var oSelectedItem = this.byId("table5").getSelectedItem();

            // Get the binding context of the selected item
            var oContext = oSelectedItem.getBindingContext();

            // Retrieve the "funktion" property value from the binding context
            var iFunktion = oContext.getProperty("funktion");

            // Create a filter based on the "funktion" property with the Equal operator
            var oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, iFunktion);

            // Apply the filter to the "table1" control's items binding
            this.byId("table1").getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
        },

        // This function is triggered when the user wants to clean/reset the filters applied to the "table1" control
        onCleanFilter: function () {
            // Clear any filters applied to the "table1" control's items binding
            this.byId("table1").getBinding("items").filter([], sap.ui.model.FilterType.Application);
        },

        // This function filters the "entit" based on the selected "typ" in the UI
        filterTyp: function () {
            // Get the selected "typ" value from the "selecttyp" control
            var selTyp = this.byId("selecttyp").getSelectedItem().getText();

            // Get the "selectentit" control
            var selEnt = this.byId("selectentit");

            // Remove all items from "selectentit"
            selEnt.removeAllItems();

            // Iterate through each item in the "aEntit" array
            this.aEntit.forEach(item => {
                // Check if the "typ" property matches the selected "typ"
                if (item.typ == selTyp) {
                    // Add a new item to "selectentit" with "entit" as key and text
                    selEnt.addItem(new sap.ui.core.Item({
                        key: item.entit,
                        text: item.entit
                    }));
                }
            });

            // Clear the selected key in "selectentit"
            this.getView().byId("selectentit").setSelectedKey(null);

            // Trigger a validation function
            this.createValidation();
        },

        // This function is similar to filterTyp but is likely used for a different purpose
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

            // Trigger a validation function specific to editing
            this.editValidation();
        },

        // This function is triggered when there is a live change in the input field
        liveChangeInput: function (oEvent) {
            // Get the input control from the event
            var oInput = oEvent.getSource();

            // Get the current value of the input and convert it to uppercase
            var sInput = oInput.getValue().toUpperCase();

            // Regular expression to match only letters (uppercase or lowercase)
            var lettersOnly = /^[A-Za-z]+$/;

            // Check if the input contains only letters
            if (lettersOnly.test(sInput)) {
                // Set the input value to the uppercase letters-only version
                oInput.setValue(sInput);
            }

            // Reset the value state of the input to "None"
            oInput.setValueState(sap.ui.core.ValueState.None);
        },

        // This function is called when there is a live change in the input for the Funktion
        onInputFunktionLiveChange: function (oEvent) {
            // Get references to the input controls
            var oInput = this.byId("__inputFunktion1"),
                iInput = this.byId("__inputFunktion1").getValue(), // Get the input value
                bExistFunktion = false;

            // Update a separate text control with the input value
            this.byId("__inputFunktion2").setText(iInput.toString());

            // Check if the input Funktion already exists in the distinct Funktion array
            this.aDistinctFunktion.forEach(item => {
                if (item.funktion === iInput) {
                    bExistFunktion = true;
                    return; // Exit the loop if the Funktion already exists
                }
            });

            // Set the value state and text based on whether the Funktion exists or not
            if (bExistFunktion) {
                oInput.setValueState(sap.ui.core.ValueState.Error);
                oInput.setValueStateText(this.getI18nText("functionExists"));
            } else {
                oInput.setValueState(sap.ui.core.ValueState.None);
                oInput.setValueStateText(this.getI18nText("noMoreTwoDigit"));
            }

            // Call a function to update validation based on the input
            this.createValidation();
        },

        // This function is called when the selection in the comboDatamart control is finished
        handleSelectionFinish: function (oEvent) {
            // Get the selected items from the event parameter
            var selectedItems = oEvent.getParameter("selectedItems"),
                // Get all items in the comboDatamart control
                aItems = this.byId("comboDatamart").getItems();

            // Initialize an array to store the selected datamarts
            this.aNewEntryDatamart = [];

            // Iterate through selected items and add their text to the array
            for (let i = 0; i < selectedItems.length; i++)
                this.aNewEntryDatamart.push(selectedItems[i].getText());

            // Check if all items are selected
            if (selectedItems.length === aItems.length)
                this.bAlleDatamart = true; // Set a flag indicating all datamarts are selected
            else
                this.bAlleDatamart = false; // Set a flag indicating not all datamarts are selected

            // Call a function to update validation based on the selection
            this.createValidation();
        },

        // This function is called when closing the view dialog
        onCloseViewDialog: function () {
            // Reset model changes
            this._oModel.resetChanges();

            // Display a toast message indicating the action was canceled
            sap.m.MessageToast.show(this.getI18nText("actionCancel"));

            // Set specific controls to initial states
            this.byId("dialog1").setBusy(true);
            this.byId("__inputWert").setValue("");
            this.byId("__inputFunktion1").setValue("");
            this.byId("__inputFunktion2").setText("");
            this.byId("comboDatamart").setSelectedKeys(null);
            this.byId("selecttyp").setSelectedKey(null);
            this.byId("selectentit").setSelectedKey(null);
            this.byId("__inputFunktion1").setEditable(true);
            this.byId("createButton").setEnabled(false);
            this.byId("addButton2").setEnabled(false);
            this.byId("deleteButton2").setEnabled(false);

            // Reset arrays and clear table items
            this.aNewEntryDatamart = [];
            this.aIOBJ_Sondern = [];
            this.aFunktion = [];
            this.aDistinctFunktion = [];
            var aItems = this.byId("table2").getItems();
            for (let i = 1; i < aItems.length; i++) {
                this.byId("table2").removeItem(aItems[i]);
            }

            // Close the dialog
            this.oDialog.close();
        },

        // This function is called when closing the edit dialog
        onCloseEditDialog: function () {
            // Reset model changes
            this._oModel.resetChanges();

            // Display a toast message indicating the action was canceled
            sap.m.MessageToast.show(this.getI18nText("actionCancel"));

            // Set specific controls to initial states
            this.byId("__inputEditFunktion").setText("");
            this.byId("__editCRUD3").setValue("");
            this.byId("selecttyp1").setSelectedKey(null);
            this.byId("selectentit1").setSelectedKey(null);
            this.aDefinition = [];
            this.aCreate = [];
            this.aDelete = [];

            // Clear table items
            var oTable = this.getView().byId("table6"),
                aItems = oTable.getItems();
            for (var i = aItems.length - 1; i > 0; i--) {
                oTable.removeItem(aItems[i]);
            }

            // Close the dialog
            this.oDialogEdit.close();
        },

        // This function is called when closing the delete dialog
        onCloseDeleteDialog: function () {
            // Reset model changes
            this._oModel.resetChanges();

            // Display a toast message indicating the action was canceled
            sap.m.MessageToast.show(this.getI18nText("actionCancel"));

            // Set specific controls to initial states
            this.byId("__textFunktion").setText("");
            this.byId("__textTyp").setText("");
            this.byId("__textEntit").setText("");
            this.byId("__textWert").setText("");
            this.aDefinitionDelete = [];
            this.aPersNumm = [];

            // Destroy items in the table
            this.byId("table3").destroyItems();

            // Close the dialog
            this.oDialogDelete.close();
        },

        // This function is called when opening the create dialog
        onOpenCreateDialog: function () {
            // Check if the dialog instance is already created
            if (!this._oDialogCRUD) {
                // Load the fragment for the create dialog
                this._oDialogCRUD = this.loadFragment({
                    name: "auth.fragment.InputFieldsHAUFW001",
                    controller: this
                });
            }

            // Open the create dialog after the fragment is loaded
            this._oDialogCRUD.then(function (oDialog) {
                // Set the dialog instance
                this.oDialog = oDialog;
                // Open the dialog
                this.oDialog.open();
                // Add a style class to the table to highlight the first row
                this.byId("table2").addStyleClass("firstRow");
            }.bind(this));

            // Initialize variables related to fetching data
            this.maxFunktion = 1;
            var that = this,
                iSkip = 0;

            // Function to fetch data from the model
            function getData() {
                // Read data from the "HAUFW001" entity set
                that._oModel.read("/HAUFW001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        // Check if there are results
                        if (oData.results && oData.results.length > 0) {
                            // Concatenate the results to the existing array
                            that.aFunktion = that.aFunktion.concat(oData.results.map(function (item) {
                                return item;
                            }));
                        }

                        // Check if there are more results to fetch
                        if (oData.results.length === 5000) {
                            // Increment the skip value and fetch more data
                            iSkip += 5000;
                            getData();
                        } else {
                            // Find the maximum Funktion value
                            that.aFunktion.forEach(item => {
                                if (item.funktion > that.maxFunktion) {
                                    that.maxFunktion = parseInt(item.funktion, 10);
                                }
                            });

                            // Create a distinct array of Funktion values
                            that.aDistinctFunktion = that.aFunktion.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.funktion === oItem.funktion; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            // Set the "busy" state of the dialog to false
                            that.byId("dialog1").setBusy(false);

                            // Call the createValidation function
                            that.createValidation();

                            // Return from the function
                            return;
                        }
                    },
                    error: function (oError) {
                        // Log an error if there is an issue fetching data
                        console.error("Fehler beim Abrufen von Daten:", oError);
                        // Set the "busy" state of the dialog to false
                        that.byId("dialog1").setBusy(false);
                    }
                });
            }

            // Call the getData function to initiate data fetching
            getData();
        },

        // This function is triggered when opening the update dialog
        onOpenUpdateDialog: function () {
            // Get the selected item from the table
            var oSelectedItem = this.byId("table1").getSelectedItem();

            // Check if an item is selected
            if (oSelectedItem) {
                // Get references to the view, binding context, and entry object
                var oView = this.getView(),
                    oContext = oSelectedItem.getBindingContext(),
                    oEntry = oContext.getObject();

                // Check if the edit dialog instance is not created
                if (!this._oDialogEdit) {
                    // Load the fragment for the edit dialog
                    this._oDialogEdit = this.loadFragment({
                        name: "auth.fragment.EditDialogHAUFW001",
                        controller: this
                    });
                }

                // Open the edit dialog after the fragment is loaded
                this._oDialogEdit.then(function (oDialog) {
                    // Set the edit dialog instance
                    this.oDialogEdit = oDialog;
                    // Add the edit dialog as a dependent to the view
                    oView.addDependent(this.oDialogEdit);
                    // Bind the edit dialog to the '/HAUFW001' entity
                    this.oDialogEdit.bindElement({
                        path: '/HAUFW001'
                    });
                    // Open the edit dialog
                    this.oDialogEdit.open();

                    // Initialize variables related to fetching data
                    var iSkip1 = 0,
                        iSkip = 0,
                        that = this,
                        oTable = this.byId("table6");

                    // Add a style class to highlight the first row of the table
                    oTable.addStyleClass("firstRow");

                    // Function to retrieve data for 'AUDMART' entity
                    function retrieveEntit() {
                        // Read data from the "AUDMART" entity set
                        that._oModel.read("/AUDMART", {
                            urlParameters: {
                                "$top": 5000,
                                "$skip": iSkip1
                            },
                            success: function (oData) {
                                // Check if there are results
                                if (oData.results && oData.results.length > 0) {
                                    // Concatenate the results to the existing array
                                    that.aDatamart = that.aDatamart.concat(oData.results.map(function (item) {
                                        return item;
                                    }));
                                }

                                // Check if there are more results to fetch
                                if (oData.results.length === 5000) {
                                    // Increment the skip value and fetch more data
                                    iSkip1 += 5000;
                                    retrieveEntit();
                                }
                            },
                            error: function (oError) {
                                // Log an error if there is an issue fetching data
                                console.error("Fehler beim Abrufen von Daten:", oError);
                            }
                        });
                    }

                    // Call the retrieveEntit function to initiate data fetching
                    retrieveEntit();

                    // Function to get data for 'HAUFW001' entity
                    function getFunktion() {
                        // Read data from the "HAUFW001" entity set
                        that._oModel.read("/HAUFW001", {
                            urlParameters: {
                                "$top": 5000,
                                "$skip": iSkip
                            },
                            success: function (oData) {
                                // Check if there is data and results
                                if (oData && oData.results) {
                                    // Iterate through the results
                                    oData.results.forEach(item => {
                                        // Check if the 'funktion' matches the selected entry's 'funktion'
                                        if (item.funktion === oEntry.funktion) {
                                            // Concatenate the matching item to the 'aDefinition' array
                                            that.aDefinition = that.aDefinition.concat(item);
                                        }
                                    });
                                }

                                // Check if there are more results to fetch
                                if (oData.results.length === 5000) {
                                    // Increment the skip value and fetch more data
                                    iSkip += 5000;
                                    getFunktion();
                                } else {
                                    // Iterate through the 'aDefinition' array
                                    that.aDefinition.forEach(item => {
                                        // Create UI elements for each item and add them to the table
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
                                                valueStateText: that.getI18nText("noMore60"),
                                                liveChange: that.liveChangeInput.bind(that)
                                            });

                                        // Switch case based on the 'typ' value
                                        switch (item.typ) {
                                            case "D":
                                                // For 'D' type, create an Input with suggestion items from 'AUDMART'
                                                oSelect.addItem(new sap.ui.core.Item({ key: "D", text: "D" }));
                                                var oInput = new sap.m.Input({
                                                    suggestionItems: {
                                                        path: "/AUDMART",
                                                        sorter: { path: 'datamart' },
                                                        template: new sap.ui.core.ListItem({
                                                            key: "{datamart}",
                                                            text: "{datamart}",
                                                            additionalText: "{Txtlg}"
                                                        })
                                                    },
                                                    placeholder: that.getI18nText("onlyExistsDatamart"),
                                                    showSuggestion: true,
                                                    value: item.wert,
                                                    valueLiveUpdate: true,
                                                    liveChange: that.liveChangeInput.bind(that),
                                                    valueStateText: that.getI18nText("noMoreTwoCharOnlyLetter"),
                                                });
                                                break;
                                            case "I":
                                                // For 'I' type, add an item to the Select
                                                oSelect.addItem(new sap.ui.core.Item({ key: "I", text: "I" }));
                                                break;
                                            case "S":
                                                // For 'S' type, add an item to the Select
                                                oSelect.addItem(new sap.ui.core.Item({ key: "S", text: "S" }));
                                                break;
                                            default:
                                                break;
                                        }

                                        // Iterate through 'aEntit' array and add items to 'oSelect1'
                                        that.aEntit.forEach(item1 => {
                                            if (item1.typ == item.typ) {
                                                oSelect1.addItem(new sap.ui.core.Item({
                                                    key: item1.entit,
                                                    text: item1.entit
                                                }));
                                            }
                                        });

                                        // Add UI elements to the column list item
                                        oColumnListItem.addCell(oText);
                                        oColumnListItem.addCell(oSelect);
                                        oColumnListItem.addCell(oSelect1);
                                        oColumnListItem.addCell(oInput);

                                        // Add the column list item to the table
                                        oTable.addItem(oColumnListItem);
                                    });
                                }
                            },
                            error: function (oError) {
                                // Log an error if there is an issue fetching data
                                console.error("Fehler beim Abrufen von Daten:", oError);
                            }
                        });
                    }

                    // Call the getFunktion function to initiate data fetching
                    getFunktion();

                    // Set the text of the '__inputEditFunktion' control to the entry's 'funktion'
                    this.byId("__inputEditFunktion").setText(oEntry.funktion);
                    // Call the 'editValidation' function
                    this.editValidation();
                }.bind(this));

            } else {
                // Show a warning message if no item is selected for update
                sap.m.MessageBox.warning(this.getI18nText("noUpdateFunction"));
            }
        },

        // This function is triggered when opening the delete dialog
        onOpenDeleteDialog: function () {
            // Get the selected item from the table
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                oView = this.getView();

            // Check if an item is selected
            if (oSelectedItem) {
                // Check if the delete dialog instance is not created
                if (!this._oDialogDelete) {
                    // Load the fragment for the delete dialog
                    this._oDialogDelete = this.loadFragment({
                        name: "auth.fragment.DeleteDialogHAUFW001",
                        controller: this
                    });
                }

                // Open the delete dialog after the fragment is loaded
                this._oDialogDelete.then(function (oDialog) {
                    // Set the delete dialog instance
                    this.oDialogDelete = oDialog;
                    // Add the delete dialog as a dependent to the view
                    oView.addDependent(this.oDialogDelete);
                    // Bind the delete dialog to the '/HAUPF001' entity
                    this.oDialogDelete.bindElement({
                        path: '/HAUPF001'
                    });
                    // Open the delete dialog
                    this.oDialogDelete.open();

                    // Get the binding context, 'funktion', 'typ', 'entit', and 'wert' properties from the selected item
                    var oContext = oSelectedItem.getBindingContext(),
                        sFunktion = oContext.getProperty("funktion"),
                        sTyp = oContext.getProperty("typ"),
                        sEntit = oContext.getProperty("entit"),
                        sWert = oContext.getProperty("wert"),
                        // Create a filter based on the 'funktion'
                        filter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.EQ, sFunktion);

                    // Apply the filter to the 'table3' binding items
                    this.byId("table3").getBinding("items").filter(filter, sap.ui.model.FilterType.Application);

                    // Set the texts of '__textFunktion', '__textTyp', '__textEntit', and '__textWert' controls
                    this.byId("__textFunktion").setText(sFunktion);
                    this.byId("__textTyp").setText(sTyp);
                    this.byId("__textEntit").setText(sEntit);
                    this.byId("__textWert").setText(sWert);
                }.bind(this));

            } else {
                // Show a warning message if no item is selected for delete
                sap.m.MessageBox.warning(this.getI18nText("noElementDelete"));
            }
        },

        // This function is responsible for validating inputs and enabling/disabling buttons accordingly
        createValidation: function () {
            // Get the value of the '__inputFunktion1' control
            var iInput = this.byId("__inputFunktion1").getValue(),
                // Get the items from the 'table2'
                aItems = this.getView().byId("table2").getItems(),
                // Get the selected values from 'selecttyp' and 'selectentit'
                selectTyp = this.getView().byId("selecttyp").getSelectedKey(),
                selectEntit = this.getView().byId("selectentit").getSelectedKey(),
                // Get the '__inputFunktion1' control
                oInput = this.byId("__inputFunktion1"),
                // Flag to check if the function already exists
                bExistFunktion = false,
                // Regular expression for letters only
                lettersOnly = /^[A-Za-z]+$/;

            // Set the text of '__inputFunktion2' to the value of '__inputFunktion1'
            this.byId("__inputFunktion2").setText(iInput.toString());

            // Check if the function already exists in 'aDistinctFunktion'
            this.aDistinctFunktion.forEach(item => {
                if (item.funktion === iInput) {
                    bExistFunktion = true;
                    return;
                }
            });

            // Validate the length of the input and whether the function already exists
            if (iInput.length > 0 && iInput.length < 3) {
                if (bExistFunktion) {
                    oInput.setValueState(sap.ui.core.ValueState.Error);
                    oInput.setValueStateText(this.getI18nText("functionExists"));
                } else {
                    oInput.setValueState(sap.ui.core.ValueState.Success);
                    oInput.setValueStateText(this.getI18nText("noFunctionExists"));
                }
            } else {
                oInput.setValueState(sap.ui.core.ValueState.Error);
                oInput.setValueStateText(this.getI18nText("noMoreTwoDigit"));
            }

            // Validation for single inputs - convert '__inputWert' to uppercase if it contains letters
            if (lettersOnly.test(this.byId("__inputWert").getValue()))
                this.byId("__inputWert").setValue(this.byId("__inputWert").getValue().toUpperCase());

            // Reset the value state of '__inputFunktion1' if the input is empty
            if (iInput == '')
                oInput.setValueState(sap.ui.core.ValueState.None);

            // Enable/disable 'addButton2' based on conditions
            if (this.aNewEntryDatamart != '' && oInput.getValueStateText() === this.getI18nText("noFunctionExists"))
                this.byId("addButton2").setEnabled(true);
            else
                this.byId("addButton2").setEnabled(false);

            // Enable/disable 'deleteButton2' and set the editability of '__inputFunktion1' based on 'table2' items
            if (aItems.length > 1) {
                oInput.setEditable(false);
                this.byId("deleteButton2").setEnabled(true);
            }
            else {
                oInput.setEditable(true);
                this.byId("deleteButton2").setEnabled(false);
            }

            // Validation for all inputs - enable/disable 'createButton' based on conditions
            if (this.aNewEntryDatamart != '' && aItems.length > 1 &&
                selectTyp && selectEntit &&
                oInput.getValueStateText() === this.getI18nText("noFunctionExists"))
                this.byId("createButton").setEnabled(true);
            else
                this.byId("createButton").setEnabled(false);
        },

        // This function is responsible for validating inputs and enabling/disabling buttons accordingly
        editValidation: function () {
            // Get the selected values from 'selecttyp1' and 'selectentit1'
            var selectTyp = this.getView().byId("selecttyp1").getSelectedKey(),
                selectEntit = this.getView().byId("selectentit1").getSelectedKey(),
                // Get the value of '__editCRUD3' control
                sInput = this.byId("__editCRUD3").getValue(),
                // Get the '__editCRUD3' control
                oInput = this.byId("__editCRUD3"),
                // Regular expression for letters only
                lettersOnly = /^[A-Za-z]+$/;

            // Reset value state and text of '__editCRUD3'
            oInput.setValueState(sap.ui.core.ValueState.None);
            oInput.setValueStateText("");

            // Convert '__editCRUD3' to uppercase if it contains letters
            if (lettersOnly.test(this.byId("__editCRUD3").getValue()))
                this.byId("__editCRUD3").setValue(this.byId("__editCRUD3").getValue().toUpperCase());

            // Check the selected values from 'selecttyp1' and 'selectentit1'
            if (selectTyp) {
                // If the selected type is 'D', enable suggestion and autocomplete
                if (this.byId("selecttyp1").getSelectedItem().getText() === "D")
                    this.byId("__editCRUD3").setShowSuggestion(true);
                else {
                    // If not, disable autocomplete and suggestion
                    this.byId("__editCRUD3").setAutocomplete(false);
                    this.byId("__editCRUD3").setShowSuggestion(false);
                }
            }
            if (selectEntit) {
                // If the selected entity is 'DATAMART', enable suggestion and autocomplete
                if (this.byId("selectentit1").getSelectedItem().getText() === "DATAMART")
                    this.byId("__editCRUD3").setShowSuggestion(true);
                else {
                    // If not, disable autocomplete and suggestion
                    this.byId("__editCRUD3").setAutocomplete(false);
                    this.byId("__editCRUD3").setShowSuggestion(false);
                }
            }

            // Validation for all inputs - enable/disable 'addButton3' based on conditions
            if (selectTyp && selectEntit && sInput !== "")
                this.byId("addButton3").setEnabled(true);
            else
                this.byId("addButton3").setEnabled(false);
        },

        // This function is triggered when the user presses the 'Add' button
        onAddPress2: function () {
            try {
                // Get the reference to the 'table2' control
                var oTable = this.byId("table2"),
                    // Create a template for a new row in the table
                    oTemplate = new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: this.byId("__inputFunktion2").getText() }),
                            new sap.m.Text({ text: this.byId("selecttyp").getSelectedItem().getText() }),
                            new sap.m.Text({ text: this.byId("selectentit").getSelectedItem().getText() }),
                            new sap.m.Text({ text: this.byId("__inputWert").getValue() })
                        ]
                    });

                // Check if any of the required fields is empty
                if (
                    this.byId("__inputFunktion2").getText() == "" ||
                    this.byId("selecttyp").getSelectedKey() == null ||
                    this.byId("selectentit").getSelectedKey() == null ||
                    this.byId("__inputWert").getValue() == ""
                ) {
                    throw new sap.ui.base.Exception("EmptyFieldException", "Incorrect Definition");
                }

                // Check for duplicate entries in the 'aIOBJ_Sondern' array
                this.aIOBJ_Sondern.forEach(element => {
                    if (
                        element[0] == this.byId("__inputFunktion2").getText() &&
                        element[1] == this.byId("selecttyp").getSelectedItem().getText() &&
                        element[2] == this.byId("selectentit").getSelectedItem().getText() &&
                        element[3] == this.byId("__inputWert").getValue()
                    ) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Incorrect Definition");
                    }
                });

                // Add the new row to the table
                oTable.addItem(oTemplate);

                // Add the new entry to the 'aIOBJ_Sondern' array
                this.aIOBJ_Sondern.push([
                    this.byId("__inputFunktion2").getText(),
                    this.byId("selecttyp").getSelectedItem().getText(),
                    this.byId("selectentit").getSelectedItem().getText(),
                    this.byId("__inputWert").getValue()
                ]);

                // Show a success message
                sap.m.MessageToast.show(this.getI18nText("successAdd"));

                // Perform validation and reset input fields
                this.createValidation();
                this.byId("selecttyp").setSelectedKey(null);
                this.byId("selectentit").setSelectedKey(null);
                this.byId("__inputWert").setValue("");
            } catch (error) {
                // Handle different types of errors and show corresponding messages
                if (error.message == "EmptyFieldException")
                    sap.m.MessageBox.warning(this.getI18nText("emptyFieldException"));
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning(this.getI18nText("duplicatedElementWarning"));
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning(this.getI18nText("emptyFieldException"));
            }
        },

        // This function is triggered when the user presses the 'Add' button in a different context
        onAddPress3: function () {
            try {
                // Get the reference to the 'table6' control and existing items
                var oTable = this.byId("table6"),
                    aItems = oTable.getItems(),
                    bDatamart = false;

                // Check if required fields are empty
                if (
                    this.byId("selecttyp1").getSelectedKey() == null ||
                    this.byId("selectentit1").getSelectedKey() == null ||
                    this.byId("__editCRUD3").getValue() == ""
                ) {
                    throw new sap.ui.base.Exception("EmptyFieldException", "Incorrect Definition");
                }

                // Check for specific conditions for certain types
                if (
                    (this.byId("selecttyp1").getSelectedItem().getText() === "I" ||
                        this.byId("selecttyp1").getSelectedItem().getText() === "S") &&
                    this.byId("__inputEditFunktion").getText() < 5
                ) {
                    throw new sap.ui.base.Exception("OnlyDatamartException", "Incorrect Definition");
                }

                // Check for duplicate entries in the table
                for (var i = 1; i < aItems.length; i++) {
                    if (
                        this.byId("__inputEditFunktion").getText() === aItems[i].getCells()[0].getText() &&
                        this.byId("selecttyp1").getSelectedItem().getText() === aItems[i].getCells()[1].getSelectedKey() &&
                        this.byId("selectentit1").getSelectedItem().getText() === aItems[i].getCells()[2].getSelectedKey() &&
                        this.byId("__editCRUD3").getValue() === aItems[i].getCells()[3].getValue()
                    ) {
                        throw new sap.ui.base.Exception("DuplicatedKey", "Incorrect Definition");
                    }
                }

                // Validate and process based on the selected type and entity
                if (
                    this.byId("selecttyp1").getSelectedItem().getText() === "D" ||
                    this.byId("selectentit1").getSelectedItem().getText() === "DATAMART"
                ) {
                    var sWert = this.byId("__editCRUD3").getValue().toUpperCase();
                    this.byId("__editCRUD3").setValue(sWert);

                    // Check if the entered Datamart exists
                    if (this.byId("__editCRUD3").getValue() === "*") {
                        bDatamart = true;
                    } else {
                        this.aDatamart.forEach(item => {
                            if (this.byId("__editCRUD3").getValue() === item.datamart) {
                                bDatamart = true;
                                return;
                            }
                        });
                    }

                    // Show error if Datamart doesn't exist
                    if (!bDatamart) {
                        this.byId("__editCRUD3").setValueStateText(this.getI18nText("noExistDatamart"));
                        this.byId("__editCRUD3").setValueState(sap.ui.core.ValueState.Error);
                        throw new sap.ui.base.Exception("DatamartNoExistException", "Incorrect Definition");
                    }
                }

                // Create a new row in the table
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
                        valueStateText: this.getI18nText("noMore60"),
                        liveChange: this.liveChangeInput.bind(this)
                    });

                // Populate the new row based on the selected type
                switch (this.byId("selecttyp1").getSelectedItem().getText()) {
                    case "D":
                        oSelect.addItem(new sap.ui.core.Item({ key: "D", text: "D" }));
                        var oInput = new sap.m.Input({
                            suggestionItems: {
                                path: "/AUDMART",
                                sorter: { path: 'datamart' },
                                template: new sap.ui.core.ListItem({
                                    key: "{datamart}",
                                    text: "{datamart}",
                                    additionalText: "{Txtlg}"
                                })
                            },
                            placeholder: this.getI18nText("onlyExistsDatamart"),
                            showSuggestion: true,
                            value: this.byId("__editCRUD3").getValue(),
                            maxLength: 2,
                            valueLiveUpdate: true,
                            liveChange: this.liveChangeInput.bind(this),
                            valueStateText: this.getI18nText("noMoreTwoCharOnlyLetter"),
                        });
                        break;
                    case "I":
                        oSelect.addItem(new sap.ui.core.Item({ key: "I", text: "I" }));
                        break;
                    case "S":
                        oSelect.addItem(new sap.ui.core.Item({ key: "S", text: "S" }));
                        break;
                    default:
                        break;
                }

                // Populate the entity dropdown based on the selected type
                this.aEntit.forEach(item1 => {
                    if (item1.typ == this.byId("selecttyp1").getSelectedItem().getText()) {
                        oSelect1.addItem(new sap.ui.core.Item({
                            key: item1.entit,
                            text: item1.entit
                        }));
                    }
                });

                // Add the cells to the new row
                oColumnListItem.addCell(oText);
                oColumnListItem.addCell(oSelect);
                oColumnListItem.addCell(oSelect1);
                oColumnListItem.addCell(oInput);

                // Add the new row to the table
                oTable.addItem(oColumnListItem);

                // Add the new entry to the 'aCreate' array
                var sFunktion = this.byId("__inputEditFunktion").getText(),
                    sTyp = this.byId("selecttyp1").getSelectedItem().getText(),
                    sEntit = this.byId("selectentit1").getSelectedItem().getText(),
                    sWert = this.byId("__editCRUD3").getValue(),
                    aRow = [sFunktion, sTyp, sEntit, sWert];

                this.aCreate.push(aRow);

                // Show a success message
                sap.m.MessageToast.show(this.getI18nText("successAdd"));

                // Reset input fields and perform validation
                this.byId("selecttyp1").setSelectedKey(null);
                this.byId("selectentit1").setSelectedKey(null);
                this.byId("__editCRUD3").setValue("");
                this.editValidation();

            } catch (error) {
                // Handle different types of errors and show corresponding messages
                if (error.message == "EmptyFieldException")
                    sap.m.MessageBox.warning(this.getI18nText("emptyFieldException"));
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning(this.getI18nText("duplicatedElementWarning"));
                if (error.message == "OnlyDatamartException")
                    sap.m.MessageBox.warning(this.getI18nText("onlyDatamartException"));
                if (error.message == "DatamartNoExistException")
                    sap.m.MessageBox.warning(this.getI18nText("noExistDatamart"));
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning(error);
            }
        },

        // Function to handle deletion of items from 'table2'
        onDeletePress2: function () {
            var oSelectedItem = this.byId("table2").getSelectedItem(),
                iIndex = this.byId("table2").indexOfItem(oSelectedItem);

            if (oSelectedItem) {
                // Check if the selected item is the first one, and show a warning message
                if (iIndex == 0) {
                    sap.m.MessageBox.warning(this.getI18nText("noDeleteElement"));
                } else {
                    // Adjust the index and remove the corresponding entry from 'aIOBJ_Sondern'
                    iIndex -= 1;
                    this.aIOBJ_Sondern.splice(iIndex, 1);
                    // Destroy the selected item from the table
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show(this.getI18nText("successDelete"));
                    // Perform validation after deletion
                    this.createValidation();
                }
            } else {
                sap.m.MessageBox.warning(this.getI18nText("noElementDelete"));
            }
            // Perform validation after deletion
            this.createValidation();
        },

        // Function to handle deletion of items from 'table6'
        onDeletePress3: function () {
            var oSelectedItem = this.byId("table6").getSelectedItem(),
                iIndex = this.byId("table6").indexOfItem(oSelectedItem);

            if (oSelectedItem) {
                // Check if the selected item is the first one, and show a warning message
                if (iIndex == 0) {
                    sap.m.MessageBox.warning(this.getI18nText("noDeleteElement"));
                } else {
                    // Adjust the index and create an array to represent the row data
                    iIndex -= 1;
                    var sFunktion = oSelectedItem.getCells()[0].getText(),
                        sTyp = oSelectedItem.getCells()[1].getSelectedItem().getText(),
                        sEntit = oSelectedItem.getCells()[2].getSelectedItem().getText(),
                        sWert = oSelectedItem.getCells()[3].getValue(),
                        aRow = [sFunktion, sTyp, sEntit, sWert],
                        bDelete = false;

                    // Iterate through the 'aCreate' array to find and remove the corresponding entry
                    for (var i = this.aCreate.length - 1; i >= 0; i--) {
                        if (JSON.stringify(this.aCreate[i]) === JSON.stringify(aRow)) {
                            this.aCreate.splice(i, 1);
                            bDelete = true;
                            break;
                        }
                    }

                    // If the entry is not found in 'aCreate', add it to the 'aDelete' array
                    if (!bDelete)
                        this.aDelete.push(aRow);

                    // Destroy the selected item from the table
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show(this.getI18nText("successDelete"));
                    // Perform validation after deletion
                    this.editValidation();
                }
            } else {
                sap.m.MessageBox.warning(this.getI18nText("noDeleteElement"));
            }
            // Perform validation after deletion
            this.editValidation();
        },

        // Function to handle the creation of entries
        onCreatePress: function () {
            // Define success and error callback functions
            var fnSuccess = function () {
                sap.m.MessageToast.show(this.getI18nText("successCreate"));
            }.bind(this);

            var fnError = function (oError) {
                sap.m.MessageBox.error(oError.message);
            }.bind(this);

            try {
                // Create an object to store new entry data
                var oNewEntryDatamart = {
                    funktion: this.getView().byId("__inputFunktion1").getValue(),
                    typ: this.getView().byId("__inputTyp1").getText(),
                    entit: this.getView().byId("__inputEntit1").getText()
                };

                // Check if all datamarts are selected
                if (this.bAlleDatamart) {
                    oNewEntryDatamart.wert = '*';
                    // Create the entry in the model
                    this._oModel.create("/HAUFW001", oNewEntryDatamart, {
                        success: fnSuccess,
                        error: fnError
                    });
                    // Refresh the binding of the table to reflect changes
                    this.byId("table1").getBinding("items").refresh();
                } else {
                    // Create entries for each selected datamart
                    this.aNewEntryDatamart.forEach(item => {
                        var oNewEntryDatamart1 = {
                            funktion: oNewEntryDatamart.funktion,
                            typ: oNewEntryDatamart.typ,
                            entit: oNewEntryDatamart.entit,
                            wert: item
                        };
                        // Create the entry in the model
                        this._oModel.create("/HAUFW001", oNewEntryDatamart1, {
                            success: fnSuccess,
                            error: fnError
                        });
                    });
                    // Refresh the binding of the table to reflect changes
                    this.byId("table1").getBinding("items").refresh();
                }

                // Create entries for additional entries in 'aIOBJ_Sondern'
                this.aIOBJ_Sondern.forEach(item => {
                    this._oModel.create("/HAUFW001", {
                        funktion: item[0],
                        typ: item[1],
                        entit: item[2],
                        wert: item[3]
                    }, {
                        success: fnSuccess,
                        error: fnError
                    });
                });

                // Refresh the binding of the table to reflect changes
                this.byId("table1").getBinding("items").refresh();

            } catch (error) {
                // Handle different types of errors
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning(this.getI18nText("emptyFieldException"));
                }
                if (error.message == "DuplicatedKey")
                    sap.m.MessageBox.warning(this.getI18nText("duplicatedElementWarning"));
            }

            // Reset values and states after creation
            this.byId("__inputFunktion1").setValue("");
            this.byId("__inputFunktion1").setEditable(true);
            this.byId("__inputFunktion1").setValueState(sap.ui.core.ValueState.None);
            this.byId("comboDatamart").setSelectedKeys(null);
            this.byId("createButton").setEnabled(false);
            this.byId("addButton2").setEnabled(false);
            this.byId("deleteButton2").setEnabled(false);

            this.byId("__inputFunktion2").setText("");
            this.byId("selecttyp").setSelectedKey(null);
            this.byId("selectentit").setSelectedKey(null);
            this.byId("__inputWert").setValue("");

            // Remove items from the 'table2' except the first one
            var aItems = this.byId("table2").getItems();
            for (let i = 1; i < aItems.length; i++) {
                this.byId("table2").removeItem(aItems[i]);
            }

            // Reset arrays
            this.aNewEntryDatamart = [];
            this.aIOBJ_Sondern = [];

            // Close the dialog
            this.byId("dialog1").close();
        },

        // Function to handle the update of entries
        onUpdateEditPress: function () {
            // Flags to track different conditions
            var bEinDatamart = false,
                bExistDatamrt = true,
                bAlleDatamart = false,
                bEmptyField = false,
                that = this, // Reference to the current object
                iTotal = this.aDefinition.length,
                iTotalSuccess = 0, // Counter for successful updates
                iItems = this.byId("table6").getItems(), // Get items from 'table6'
                fnSuccess = function () {
                    sap.m.MessageToast.show(this.getI18nText("successUpdateFunction"));
                }.bind(this), // Success callback function
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                }.bind(this); // Error callback function

            try {
                // Loop through items in 'table6' to perform validations
                for (let i = 1; i < iItems.length; i++) {
                    if (iItems[i].getCells()[1].getSelectedItem().getText() === "D") {
                        var oInput = iItems[i].getCells()[3],
                            sInput = oInput.getValue(),
                            bDatamartOK = false;

                        bEinDatamart = true;
                        if (sInput === "*") {
                            bDatamartOK = true;
                            bAlleDatamart = true;
                        } else {
                            // Check if the entered Datamart exists
                            this.aDatamart.forEach(item => {
                                if (sInput === item.datamart) {
                                    bDatamartOK = true;
                                }
                            });
                        }
                        if (!bDatamartOK) {
                            bExistDatamrt = false;
                            oInput.setValueStateText(this.getI18nText("noExistDatamart"));
                            oInput.setValueState(sap.ui.core.ValueState.Error);
                        }
                    }
                    if (iItems[i].getCells()[3].getValue() === "") {
                        iItems[i].getCells()[3].setValueState(sap.ui.core.ValueState.Error);
                        iItems[i].getCells()[3].setValueStateText(this.getI18nText("emptyField"));
                        bEmptyField = true;
                    }
                }
                if (bEmptyField)
                    throw new sap.ui.base.Exception("EmptyFieldException", "Incorrect definition");

                if (!bExistDatamrt)
                    throw new sap.ui.base.Exception("IncorrectDatamartException", "Incorrect definition");

                if (!bEinDatamart)
                    throw new sap.ui.base.Exception("NoDatamartException", "Incorrect definition");

                // Loop through 'aDefinition' to remove existing entries
                this.aDefinition.forEach(item => {
                    var sURL = "/HAUFW001(funktion='" + item.funktion + "',typ='" + item.typ + "',entit='" + item.entit + "',wert='" + item.wert + "')";
                    // Remove entry from the model
                    this._oModel.remove(sURL, {
                        success: function () {
                            iTotalSuccess++;
                            // Check if all removals were successful
                            if (iTotalSuccess === iTotal) {
                                var aCreateUpd = [],
                                    bFirst = true;
                                // Loop through items in 'table6' to collect data for creation
                                for (let i = 1; i < iItems.length; i++) {
                                    if (bAlleDatamart && bFirst && iItems[i].getCells()[1].getSelectedItem().getText() === "D") {
                                        var aRow = [iItems[i].getCells()[0].getText(),
                                        iItems[i].getCells()[1].getSelectedItem().getText(),
                                        iItems[i].getCells()[2].getSelectedItem().getText(),
                                            "*"];
                                        aCreateUpd.push(aRow);
                                        bFirst = false;
                                    } else if (bAlleDatamart && !bFirst && iItems[i].getCells()[1].getSelectedItem().getText() === "D") {
                                        continue;
                                    } else {
                                        var aRow = [iItems[i].getCells()[0].getText(),
                                        iItems[i].getCells()[1].getSelectedItem().getText(),
                                        iItems[i].getCells()[2].getSelectedItem().getText(),
                                        iItems[i].getCells()[3].getValue()];
                                        aCreateUpd.push(aRow);
                                    }
                                }

                                // Loop through 'aCreateUpd' to create entries in the model
                                aCreateUpd.forEach(item => {
                                    that._oModel.create("/HAUFW001", {
                                        funktion: item[0],
                                        typ: item[1],
                                        entit: item[2],
                                        wert: item[3]
                                    }, {
                                        success: fnSuccess,
                                        error: fnError
                                    });
                                });

                                // Reset values and arrays
                                that.byId("__inputEditFunktion").setText("");
                                that.byId("__editCRUD3").setValue("");
                                that.byId("selecttyp1").setSelectedKey(null);
                                that.byId("selectentit1").setSelectedKey(null);
                                that.aDefinition = [];
                                that.aCreate = [];
                                that.aDelete = [];

                                // Remove items from 'table6'
                                var oTable = that.getView().byId("table6"),
                                    aItems = oTable.getItems();
                                for (var i = aItems.length - 1; i > 0; i--) {
                                    oTable.removeItem(aItems[i]);
                                }

                                // Close the edit dialog
                                that.oDialogEdit.close();

                                // Refresh the binding of 'table1'
                                that.byId("table1").getBinding("items").refresh();
                            }
                        },
                        error: fnError
                    });
                });
            } catch (error) {
                // Handle different types of errors
                if (error instanceof TypeError)
                    sap.m.MessageBox.warning(this.getI18nText("emptyFieldException"));

                if (error.message == "EmptyFieldException")
                    sap.m.MessageBox.warning(this.getI18nText("emptyFieldFunction"));

                if (error.message == "NoDatamartException")
                    sap.m.MessageBox.warning(this.getI18nText("noDatamartException"));

                if (error.message == "IncorrectDatamartException")
                    sap.m.MessageBox.warning(this.getI18nText("incorrectDatamartException"));
            }
        },

        // Function to handle deletion of entries in the table1
        onDeletePress: function () {
            // Get all items from the 'table1'
            var aItems = this.byId("table1").getItems(),
                // Get the selected item
                oSelectedItem = this.byId("table1").getSelectedItem(),
                // Success callback function
                fnSuccess = function () {
                    sap.m.MessageToast.show("Element (" + sFunktion + ")" + this.getI18nText("deletePressSuccess"));
                },
                // Error callback function
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                },
                // Reference to the current object
                that = this;

            // Check if an item is selected
            if (oSelectedItem) {
                // Show a confirmation dialog with options
                sap.m.MessageBox.confirm(this.getI18nText("deleteCompleteFunction"), {
                    title: this.getI18nText("msgBoxTitleDelete"),
                    actions: [sap.m.MessageBox.Action.YES, this.getI18nText("oneElementDelete"), sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: this.getI18nText("oneElementDelete"),
                    styleClass: "confirmMessageBox",
                    onClose: function (sAction) {
                        // Handle the selected action
                        if (sAction === sap.m.MessageBox.Action.YES) {
                            // Open the delete dialog for the entire function
                            that.onOpenDeleteDialog();
                        } else if (sAction === this.getI18nText("oneElementDelete")) {
                            // Get the binding context of the selected item
                            var oContext = oSelectedItem.getBindingContext(),
                                // Array to store entries with the same function
                                aFunktion = [],
                                // Get property values from the binding context
                                sFunktion = oContext.getProperty("funktion"),
                                sTyp = oContext.getProperty("typ"),
                                sEntit = oContext.getProperty("entit"),
                                sWert = oContext.getProperty("wert"),
                                // Build the URL for the DELETE request
                                sURL = "/HAUFW001(funktion='" + sFunktion + "',typ='" + sTyp + "',entit='" + sEntit + "',wert='" + sWert + "')";

                            // Check if the selected item has type 'D' and value '*'
                            if (sTyp === "D" && sWert === "*")
                                sap.m.MessageBox.warning(this.getI18nText("noDeleteAlleDatamart"));
                            else if (sTyp === "D") {
                                var iCount = 0;
                                // Loop through all items to find entries with the same function
                                for (let i = 0; i < aItems.length; i++) {
                                    if (aItems[i].getCells()[0].getText() === sFunktion)
                                        aFunktion.push([aItems[i].getCells()[0].getText(),
                                        aItems[i].getCells()[1].getText(),
                                        aItems[i].getCells()[2].getText(),
                                        aItems[i].getCells()[3].getText()]);
                                }
                                // Count the number of entries with type 'D'
                                aFunktion.forEach(item => {
                                    if (item[1] === "D")
                                        ++iCount;
                                });
                                // Check if there is at least one entry with type 'D'
                                if (iCount < 2)
                                    sap.m.MessageBox.warning(this.getI18nText("noDeleteAlleDatamart"));
                                else
                                    // Remove the entry using the DELETE request
                                    that._oModel.remove(sURL, {
                                        success: fnSuccess,
                                        error: fnError
                                    });
                            } else {
                                // Remove the entry using the DELETE request
                                that._oModel.remove(sURL, {
                                    success: fnSuccess,
                                    error: fnError
                                });
                            }
                        } else {
                            sap.m.MessageToast.show(this.getI18nText("actionCancel"));
                        }
                    }
                });
            } else {
                sap.m.MessageBox.warning(this.getI18nText("noElementDelete"));
            }
        },

        // Function to handle deletion of all entries related to a function
        onDeleteAllPress: function () {
            // Get the selected item from 'table1'
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                // Success callback function for deletion
                fnSuccess = function () {
                    sap.m.MessageToast.show("Element (" + sFunktion + ")" + this.getI18nText("deletePressSuccess"));
                },
                // Error callback function for deletion
                fnError = function (oError) {
                    sap.m.MessageBox.error(oError.message);
                },
                // Get the binding context of the selected item
                oContext = oSelectedItem.getBindingContext(),
                // Get the 'funktion' property value
                sFunktion = oContext.getProperty("funktion"),
                // Reference to the current object
                that = this,
                // Skip count for OData query
                iSkip = 0,
                // Skip count for another OData query
                iSkip1 = 0;

            // Function to retrieve and delete related entries from 'HAUFW001'
            function getFunktion() {
                that._oModel.read("/HAUFW001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        // Array to store entries related to the function
                        if (oData.results && oData.results.length > 0) {
                            oData.results.forEach(item => {
                                if (item.funktion === sFunktion) {
                                    that.aDefinitionDelete = that.aDefinitionDelete.concat(item);
                                }
                            });
                        }
                        if (oData.results.length === 5000) {
                            // If there are more results, update the skip count and make another request
                            iSkip += 5000;
                            getFunktion();
                        } else {
                            // Once all entries are collected, delete them
                            that.aDefinitionDelete.forEach(item => {
                                var sURL = "/HAUFW001(funktion='" + item.funktion + "',typ='" + item.typ + "',entit='" + item.entit + "',wert='" + item.wert + "')";
                                that._oModel.remove(sURL, {
                                    success: fnSuccess,
                                    error: fnError
                                });
                            });
                        }
                    },
                    error: function (oError) {
                        console.error("Fehler beim Abrufen von Daten:", oError);
                    }
                });
            }
            // Execute the function to retrieve and delete entries from 'HAUFW001'
            getFunktion();

            // Function to retrieve and delete related entries from 'HAUPF001'
            function getPersNumm() {
                that._oModel.read("/HAUPF001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip1
                    },
                    success: function (oData) {
                        // Array to store entries related to the function
                        if (oData.results && oData.results.length > 0) {
                            oData.results.forEach(item => {
                                if (item.funktion === sFunktion) {
                                    that.aPersNumm = that.aPersNumm.concat(item);
                                }
                            });
                        }
                        if (oData.results.length === 5000) {
                            // If there are more results, update the skip count and make another request
                            iSkip1 += 5000;
                            getPersNumm();
                        } else {
                            // Once all entries are collected, delete them
                            that.aPersNumm.forEach(item => {
                                var sURL = "/HAUPF001(personalnummer='" + item.personalnummer + "',funktion='" + item.funktion + "')";
                                that._oModel.remove(sURL, {
                                    success: fnSuccess,
                                    error: fnError
                                });
                            });

                            // Clear arrays and UI elements
                            that.aDefinitionDelete = [];
                            that.aPersNumm = [];
                            that.byId("__textFunktion").setText("");
                            that.byId("__textTyp").setText("");
                            that.byId("__textEntit").setText("");
                            that.byId("__textWert").setText("");
                            that.byId("table3").destroyItems();

                            // Close the delete dialog
                            that.oDialogDelete.close();
                        }
                    },
                    error: function (oError) {
                        console.error("Fehler beim Abrufen von Daten:", oError);
                    }
                });
            }
            // Execute the function to retrieve and delete entries from 'HAUPF001'
            getPersNumm();
        },

        // Function to handle search in the 'table1' based on user input
        onSearch1: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                // Create a filter with multiple conditions on different properties
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("typ", sap.ui.model.FilterOperator.Contains, sQuery[0]),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("wert", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("entit", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);
                aFilters.push(filter);
            }
            // Apply the filters to the 'table1' binding
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
        },

        // Function to get the view settings dialog based on the provided fragment name
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
            if (!pDialog) {
                // Load the fragment and create the dialog if it doesn't exist
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

        // Function to reset the group dialog on an event
        resetGroupDialog: function (oEvent) {
            this.groupReset = true;
        },

        // Function to handle the sort button press and open the sort dialog
        handleSortButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.SortDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Function to handle the filter button press and open the filter dialog
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.FilterDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Function to handle the group button press and open the group dialog
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.GroupDialogHAUFW001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Function to handle the confirmation of the sort dialog
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sort = oEvent.getParameter("sortItem"),
                aSorters = [];

            // If a sort item is selected, create a sorter and apply it to the table binding
            if (sort) {
                var sPath = mParams.sortItem.getKey(),
                    bDescending = mParams.sortDescending;

                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                this.byId("sortUsersButton").setType("Emphasized");
            } else
                this.byId("sortUsersButton").setType("Default");

            this.byId("table1").getBinding("items").sort(aSorters);
        },

        // Function to handle the confirmation of the filter dialog
        handleFilterDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                aFilters = [];

            // Create filters based on the selected filter items and apply them to the table binding
            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sValue = aSplit[1],
                    oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            });
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

            // Set the button type based on whether filters are applied
            var filters = oEvent.getParameter("filterItems");
            if (filters.length > 0)
                this.byId("filterButton").setType("Emphasized");
            else
                this.byId("filterButton").setType("Default");
        },

        // Function to handle the confirmation of the group dialog
        handleGroupDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                vGroup,
                aGroups = [];

            // If a group item is selected, create a sorter with grouping and apply it to the table binding
            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];
                aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

                this.byId("table1").getBinding("items").sort(aGroups);
                this.byId("groupButton").setType("Emphasized");
            } else if (this.groupReset) {
                // If no group item is selected and a reset is requested, remove grouping
                this.byId("table1").getBinding("items").sort();
                this.byId("groupButton").setType("Default");
                this.groupReset = false;
            }
        },

        // Function to create column configuration for Excel export
        createColumnConfig: function () {
            var aCols = [];

            // Column definition for 'funktion' with data type Number
            aCols.push({
                property: 'funktion',
                type: sap.ui.export.EdmType.Number
            });

            // Column definition for 'typ' with data type String
            aCols.push({
                property: 'typ',
                type: sap.ui.export.EdmType.String
            });

            // Column definition for 'entit' with data type String
            aCols.push({
                property: 'entit',
                type: sap.ui.export.EdmType.String
            });

            // Column definition for 'wert' with data type String
            aCols.push({
                property: 'wert',
                type: sap.ui.export.EdmType.String
            });

            return aCols;
        },

        // Function triggered when the user initiates the export action
        onExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            // Check if the table reference is already stored, if not, retrieve it
            if (!this._oTable) {
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;

            // Get the binding of the table's rows
            oRowBinding = oTable.getBinding('items');

            // Create column configuration for Excel export
            aCols = this.createColumnConfig();

            // Settings for Excel export
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export HAUFW001.xlsx',
                worker: false
            };

            // Create a new instance of the sap.ui.export.Spreadsheet class
            oSheet = new sap.ui.export.Spreadsheet(oSettings);

            // Build the spreadsheet and destroy the instance
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        }
    });
});
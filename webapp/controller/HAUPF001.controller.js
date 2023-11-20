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
        // Initialization function
        onInit: function () {
            // Global variables
            this._oModel = this.getOwnerComponent().getModel();
            this.aValue = [];
            this.aSelectedPersonal = [];
            this.aSelectedFunktion = [];
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            this._oPage = this.byId("dynamicPage1");
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

            // Set App language to German
            sap.ui.getCore().getConfiguration().setLanguage("de");

            // Get Filters Data
            var that = this,
                iSkip = 0;

            function retrieveData() {
                that._oModel.read("/HAUPF001", {
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
                            // Deduplicate data based on 'personalnummer' and 'funktion'
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

                            // Sort 'aDistinctItems1' based on 'funktion'
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

                            // Create JSON models for distinct items
                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            oDistinctModel.setSizeLimit(2000);

                            // Set models for multiComboBoxes in the view
                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiFunktion").setModel(oDistinctModel1);

                            // Disable busy indicator on the page
                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (oError) {
                        console.error("Error retrieving data:", oError);
                    }
                });
            }
            retrieveData();
        },
        // Event handler for navigation button press
        onNavButtonPressed: function () {
            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);
            UIComponent.getRouterFor(this).navTo("RouteFunktion");
        },
        // Function triggered when a list item is pressed
        onListItemPress: function (oEvent) {
            /*this.oView.getParent().getParent().setLayout(sap.f.LayoutType.TwoColumnsBeginExpanded); */

            // Get the path of the selected list item's binding context
            var funktionPath = oEvent.getSource().getBindingContext().getPath(),
                // Use a regular expression to extract the 'funktion' value from the path
                funktion = funktionPath.match(/funktion='(\d+)'/);

            // Check if 'funktion' was successfully extracted
            if (funktion && funktion.length > 1) {
                // Navigate to the detail view with the extracted 'funktion' value
                UIComponent.getRouterFor(this).navTo("RouteDetailPersFKT", {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    funktion: funktion[1]
                });
            }

            // Additional commented-out code
            // const numeroExtraido = funktion[1];
            // this.oRouter.getRoute("RouteDetailPersFKT").attachPatternMatched(this._onFunktionMatched, this);
            // this.oRouter.getRoute("RouteMasterPersFKT").attachPatternMatched(this._onFunktionMatched, this);
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
                return "No filters active";
            }

            if (aFiltersWithValues.length === 1) {
                return aFiltersWithValues.length + " filter active: " + aFiltersWithValues.join(", ");
            }

            return aFiltersWithValues.length + " filters active: " + aFiltersWithValues.join(", ");
        },
        // Function to get formatted summary text for the expanded FilterBar
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
        // Event handler for search action
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
        // Function to open the dialog
        onOpenDialog: function () {
            // Check if the dialog is not already created
            if (!this._oDialogCRUD) {
                // Load the dialog fragment (if not loaded)
                this._oDialogCRUD = this.loadFragment({
                    name: "auth.fragment.InputFieldsHAUPF001",
                    controller: this
                });
            }

            // Open the dialog when it is ready
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
            }.bind(this));
        },

        // Function to close the dialog
        onCloseViewDialog: function () {
            // Reset model changes
            this._oModel.resetChanges();

            // Show a message indicating that the action was canceled
            sap.m.MessageToast.show("Action canceled");

            // Reset and clear certain input fields and tokens
            this.byId("multiInputPers").setValue("");
            this.byId("multiInputFunktion").setValue("");
            this.byId("multiInputPers").removeAllTokens();
            this.byId("multiInputFunktion").removeAllTokens();

            // Reset arrays storing selected values
            this.aSelectedFunktion = [];
            this.aSelectedPersonal = [];

            // Remove items from a table (assuming "table2" is a table)
            var aItems = this.byId("table2").getItems();
            for (let i = 1; i < aItems.length; i++) {
                this.byId("table2").removeItem(aItems[i]);
            }

            // Close the dialog
            this.oDialog.close();
        },

        onCloseEditDialog: function () {
            this._oModel.resetChanges();
            sap.m.MessageToast.show("Aktion abgebrochen");
            this.getView().byId("__editCRUD0").setValue("");
            this.getView().byId("__editCRUD1").setValue("");
            this.oDialogEdit.close();
        },
        // Function to handle value help requests for personal numbers
        onValueHelpRequestPersonal: function (oEvent) {
            var oView = this.getView(),
                sInputValue = oEvent.getSource().getValue();

            // Check if the value help dialog is not already created
            if (!this._pValueHelpDialog1) {
                this._pValueHelpDialog1 = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "auth.fragment.ValueHelpDialogPersonal",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    // Add the value help dialog as a dependent of the view
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }

            // Open the value help dialog
            this._pValueHelpDialog1.then(function (oValueHelpDialog) {
                // Apply a filter to the items in the value help dialog based on the input value
                oValueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
                    "personalnummer",
                    sap.ui.model.FilterOperator.Contains,
                    sInputValue
                )]);
                oValueHelpDialog.open();
            }.bind(this));
        },

        // Function to handle value help requests for functions
        onValueHelpRequestFunktion: function (oEvent) {
            var oView = this.getView(),
                sInputValue = oEvent.getSource().getValue();

            // Check if the value help dialog is not already created
            if (!this._pValueHelpDialog2) {
                this._pValueHelpDialog2 = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "auth.fragment.ValueHelpDialogFunktion",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    // Add the value help dialog as a dependent of the view
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }

            // Open the value help dialog
            this._pValueHelpDialog2.then(function (oValueHelpDialog) {
                // Apply a filter to the items in the value help dialog based on the input value
                oValueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
                    "funktion",
                    sap.ui.model.FilterOperator.Contains,
                    sInputValue
                )]);
                oValueHelpDialog.open();
            }.bind(this));
        },

        // Function triggered when the value help dialog is closed
        onValueHelpDialogClose: function (oEvent) {
            // Show a toast message indicating that the action was canceled
            sap.m.MessageToast.show("Action canceled");

            // Remove any applied filters on the items in the value help dialog
            oEvent.getSource().getBinding("items").filter([]);
        },

        // Function called when searching for personal numbers in the value help dialog
        onSearchPersonal: function (oEvent) {
            // Retrieve the search value from the event parameters
            var sValue = oEvent.getParameter("value");

            // Create a filter based on the search value for the "personalnummer" property
            var oFilter = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sValue);

            // Apply the filter to the items in the value help dialog
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },

        // Function triggered when suggesting personal numbers based on user input
        suggestPersonalnummer: function (oEvent) {
            // Retrieve the suggested value from the event parameters
            var sValue = oEvent.getParameter("suggestValue");

            // Create a filter based on the suggested value for the "personalnummer" property
            var oFilter = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sValue);

            // Apply the filter to the suggestion items
            var oBinding = oEvent.getSource().getBinding("suggestionItems");
            oBinding.filter([oFilter]);
        },

        // Function called when searching for functions in the value help dialog
        onSearchFunktion: function (oEvent) {
            // Retrieve the search value from the event parameters
            var sValue = oEvent.getParameter("value");

            // Create a filter based on the search value for the "funktion" property
            var oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sValue);

            // Apply the filter to the items in the value help dialog
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },

        // Function triggered when suggesting functions based on user input
        suggestFunktion: function (oEvent) {
            // Retrieve the suggested value from the event parameters
            var sValue = oEvent.getParameter("suggestValue");

            // Create a filter based on the suggested value for the "funktion" property
            var oFilter = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sValue);

            // Apply the filter to the suggestion items
            var oBinding = oEvent.getSource().getBinding("suggestionItems");
            oBinding.filter([oFilter]);
        },

        // Function triggered when the tokens in the multi-input for personal numbers are updated
        multiInputPersTokenUpdate: function (oEvent) {
            // Retrieve selected contexts and the multi-input control
            var aContexts = oEvent.getParameter("selectedContexts"),
                oMultiInput = this.byId("multiInputPers"),
                that = this;

            // Handle different token update types
            switch (oEvent.getParameter("type")) {
                case "added":
                    // Process added tokens by updating the array of selected personal numbers
                    oEvent.getParameter("addedTokens").forEach(oToken => {
                        that.aSelectedPersonal.push({
                            personalnummer: oToken.getText(),
                            Txtmd: ""
                        });
                    }, this);
                    break;
                case "removed":
                    // Process removed tokens by updating the array of selected personal numbers
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
                    // Process other token update types (e.g., initial values)
                    if (aContexts && aContexts.length) {
                        // Process selected contexts by updating the array of selected personal numbers and displaying a toast message
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
                        var selectedValues = "Selected Personal Numbers: " + aContexts.map(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            return oSelectedObject.personalnummer;
                        }).join(", ");
                        sap.m.MessageToast.show(selectedValues);
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    break;
            }

            // Perform validation based on selected values
            this.createValidation();
        },

        // Function triggered when the tokens in the multi-input for functions are updated
        multiInputFunktionTokenUpdate: function (oEvent) {
            // Retrieve selected contexts and the multi-input control
            var aContexts = oEvent.getParameter("selectedContexts"),
                oMultiInput = this.byId("multiInputFunktion"),
                that = this;

            // Handle different token update types
            switch (oEvent.getParameter("type")) {
                case "added":
                    // Process added tokens by updating the array of selected functions
                    oEvent.getParameter("addedTokens").forEach(oToken => {
                        that.aSelectedFunktion.push({
                            funktion: oToken.getText(),
                            Txtlg: ""
                        });
                    }, this);
                    break;
                case "removed":
                    // Process removed tokens by updating the array of selected functions
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
                    // Process other token update types (e.g., initial values)
                    if (aContexts && aContexts.length) {
                        // Process selected contexts by updating the array of selected functions and displaying a toast message
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
                        var selectedValues = "Selected Functions: " + aContexts.map(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            return oSelectedObject.funktion;
                        }).join(", ");
                        sap.m.MessageToast.show(selectedValues);
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    break;
            }

            // Perform validation based on selected values
            this.createValidation();
        },

        // Function triggered when the add button is pressed
        onAddPress2: function () {
            // Initialize template array and get table items
            var aTemplate = [],
                aItems = this.byId("table1").getItems(),
                that = this;

            // Generate template array by combining selected functions and personal numbers
            this.aSelectedFunktion.forEach(fkt => {
                that.aSelectedPersonal.forEach(personal => {
                    aTemplate.push({
                        personalnummer: personal.personalnummer,
                        funktion: fkt.funktion
                    });
                });
            });

            try {
                // Get reference to table and initialize variables
                var oTable = this.byId("table2"),
                    bAssigExist = false,
                    aAssigExist = [],
                    aAssigOK = [],
                    aColumnListItems = [];

                // Check for existing assignments in the table
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

                // Display warning message if assignments already exist
                if (bAssigExist) {
                    var sMessage = "The following assignments already exist:\n \n";
                    aAssigExist.forEach(function (item) {
                        sMessage += "Personal Number: " + item.personalnummer + " => Function: " + item.funktion + "\n";
                    });
                    sap.m.MessageBox.warning(sMessage);
                }

                // Process valid assignments and update the table
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

                // Display success message and reset input controls
                sap.m.MessageToast.show("Element successfully added");

                this.byId("multiInputPers").removeAllTokens();
                this.byId("multiInputFunktion").removeAllTokens();
                this.aSelectedFunktion = [];
                this.aSelectedPersonal = [];
                this.createValidation();

            } catch (error) {
                // Handle specific error cases and display corresponding warning messages
                if (error.message == "DuplicatedKey") {
                    sap.m.MessageBox.warning("An element already exists");
                }
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning("No element can be added, empty fields are present");
                }
            }
        },

        // Function triggered when the delete button is pressed in table2
        onDeletePress2: function () {
            // Get the selected item and its index
            var oSelectedItem = this.byId("table2").getSelectedItem(),
                iIndex = this.byId("table2").indexOfItem(oSelectedItem);

            if (oSelectedItem) {
                // Check if the selected item is the header (index 0)
                if (iIndex == 0) {
                    sap.m.MessageBox.warning("This element cannot be deleted");
                } else {
                    // Destroy the selected item and show success message
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show("Assignment successfully deleted");
                }
            } else {
                // Show warning if no item is selected for deletion
                sap.m.MessageBox.warning("No element selected for deletion!");
            }

            // Trigger validation after deletion
            this.createValidation();
        },

        // Function to perform validation and enable/disable buttons based on conditions
        createValidation: function () {
            // Get items from table2
            var aItems = this.getView().byId("table2").getItems();

            // Enable/disable buttons based on the number of items in table2
            if (aItems.length > 1) {
                this.byId("createButton").setEnabled(true);
                this.byId("deleteButton2").setEnabled(true);
            } else {
                this.byId("createButton").setEnabled(false);
                this.byId("deleteButton2").setEnabled(false);
            }

            // Enable/disable addButton2 based on the selectedFunktion and selectedPersonal arrays
            if (this.aSelectedFunktion != '' && this.aSelectedPersonal != '')
                this.byId("addButton2").setEnabled(true);
            else
                this.byId("addButton2").setEnabled(false);
        },

        // Function triggered when the create button is pressed
        onCreatePress: function () {
            try {
                // Get reference to the table2
                var oTable = this.getView().byId("table2"),
                    aItems = oTable.getItems(), // Get all items from table2
                    aCreate = [], // Array to store data for creation
                    that = this,
                    fnSuccess = function () {
                        sap.m.MessageToast.show("Function successfully assigned");
                    }.bind(this),
                    fnError = function (oError) {
                        sap.m.MessageBox.error(oError.message);
                    }.bind(this);

                // Iterate through items in table2 to collect data for creation
                for (let i = 1; i < aItems.length; i++) {
                    var aRow = [aItems[i].getCells()[0].getText(),
                    aItems[i].getCells()[1].getText()];
                    aCreate.push(aRow);
                }

                // Create entries in the backend using collected data
                aCreate.forEach(item => {
                    that._oModel.create("/HAUPF001", {
                        personalnummer: item[0],
                        funktion: item[1]
                    }, {
                        success: fnSuccess,
                        error: fnError
                    });
                });

                // Remove items from table2 after successful creation
                for (var i = aItems.length - 1; i > 0; i--) {
                    oTable.removeItem(aItems[i]);
                }

                // Close the dialog after successful creation
                this.oDialog.close();

                // Refresh the binding of table1 to reflect the changes
                this.byId("table1").getBinding("items").refresh();
            } catch (error) {
                // Handle a TypeError, if any, during the creation process
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning("No element can be added, empty fields are present");
                }
            }
        },
        // Function triggered when delete button is pressed
        onDeletePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSuccess = function () {
                    // Display a success message with the deleted personal number
                    sap.m.MessageToast.show("Personal number (" + sPersNummer + ") successfully deleted");
                },
                fnError = function (oError) {
                    // Display an error message if deletion fails
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext(),
                    sPersNummer = oContext.getProperty("personalnummer"),
                    sFunktion = oContext.getProperty("funktion"),
                    sURL = "/HAUPF001(personalnummer='" + sPersNummer + "',funktion='" + sFunktion + "')";

                // Perform deletion by sending a request to the backend
                this._oModel.remove(sURL, {
                    success: fnSuccess,
                    error: fnError
                });
            } else {
                // Display a warning if no item is selected for deletion
                sap.m.MessageBox.warning("No element selected for deletion");
            }
        },

        // Function triggered when searching in table1
        onSearch1: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                // Create filters based on personal number and function containing the search query
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);

                // Add the filter to the array of filters
                aFilters.push(filter);
            }

            // Apply the filters to the binding of items in table1
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
        },

        // Get or create a view settings dialog based on the specified fragment name
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            // If the dialog does not exist, load it from the specified fragment
            if (!pDialog) {
                pDialog = sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    return oDialog;
                });

                // Cache the loaded dialog to avoid reloading
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }

            return pDialog;
        },

        // Set a flag to reset group settings when called
        resetGroupDialog: function (oEvent) {
            this.groupReset = true;
        },

        // Open the sort dialog when the sort button is pressed
        handleSortButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.SortDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Open the filter dialog when the filter button is pressed
        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.FilterDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Open the group dialog when the group button is pressed
        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("auth.fragment.GroupDialogHAUPF001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        }

        // Handle the confirmation of sorting dialog
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sort = oEvent.getParameter("sortItem"),
                aSorters = [];

            // Check if a sort item is selected
            if (sort) {
                var sPath = mParams.sortItem.getKey(),
                    bDescending = mParams.sortDescending;

                // Create a sorter based on the selected path and descending option
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                this.byId("sortUsersButton").setType("Emphasized");
            } else {
                // Set the button type to default if no sort item is selected
                this.byId("sortUsersButton").setType("Default");
            }

            // Apply sorting to the table based on the selected sorters
            this.byId("table1").getBinding("items").sort(aSorters);
        },

        // Handle the confirmation of filter dialog
        handleFilterDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                aFilters = [];

            // Iterate through filter items and create filters based on the selected values
            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sValue = aSplit[1],
                    oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            });

            // Apply filters to the table based on the selected filter options
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

            // Update the filter button type based on the presence of filters
            var filters = oEvent.getParameter("filterItems");
            if (filters.length > 0) {
                this.byId("filterButton").setType("Emphasized");
            } else {
                this.byId("filterButton").setType("Default");
            }
        },

        // Handle the confirmation of grouping dialog
        handleGroupDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                vGroup,
                aGroups = [];

            // Check if a group item is selected
            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];

                // Create a sorter based on the selected path, descending option, and grouping function
                aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

                // Apply grouping to the table based on the selected group options
                this.byId("table1").getBinding("items").sort(aGroups);
                this.byId("groupButton").setType("Emphasized");
            } else if (this.groupReset) {
                // Reset grouping and set button type to default if specified
                this.byId("table1").getBinding("items").sort();
                this.byId("groupButton").setType("Default");
                this.groupReset = false;
            }
        }

        // Function to create column configuration for export
        createColumnConfig: function () {
            var aCols = [];

            // Define columns for personal number and function
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

        // Function to handle export of table data to Excel
        onExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            // Check if the table instance is available
            if (!this._oTable) {
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;

            // Get the binding of items in the table
            oRowBinding = oTable.getBinding('items');

            // Create column configuration using the specified function
            aCols = this.createColumnConfig();

            // Configure export settings
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export HAUPF001.xlsx',
                worker: false
            };

            // Create a new Spreadsheet instance and initiate the export
            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                // Destroy the Spreadsheet instance after the export is complete
                oSheet.destroy();
            });
        }
    });
});
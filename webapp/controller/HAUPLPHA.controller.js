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
        // Initialization function
        onInit: function () {
            // Global variables
            this.aValue = [];
            this.aPhase = [];
            this.aSelectedPersonal = [];
            this.aSelectedPhase = [];
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};
            this._oModel = this.getOwnerComponent().getModel();
            this._oPage = this.byId("dynamicPage1");
            this.oView = this.getView();
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

            // Set Language App to German
            sap.ui.getCore().getConfiguration().setLanguage("de");

            // Get Filters Data
            var that = this,
                iSkip = 0;
            function retrieveData() {
                that._oModel.read("/HAUPLPHA", {
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
                            // Deduplicate data based on 'personalnummer' and 'pla_pha'
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

                            // Create JSON models for distinct items
                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            // Set size limit for the models
                            oDistinctModel.setSizeLimit(2000);

                            // Update global variables
                            that.aPhase = aDistinctItems1;

                            // Set models for multiComboBoxes in the view
                            that.getView().byId("multiPersonal").setModel(oDistinctModel);
                            that.getView().byId("multiPla_pha").setModel(oDistinctModel1);

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
            // Initial call to retrieve data
            retrieveData();
        },
        // Event handler for navigation button press
        onNavButtonPressed: function () {
            //this.oView.getParent().getParent().setLayout(sap.f.LayoutType.OneColumn);

            // Navigate to the "RouteHome" using the router
            UIComponent.getRouterFor(this).navTo("RouteHome");
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
        // Event handler for value help request
        onValueHelpRequest: function (oEvent) {
            var oView = this.getView(),
                sInputValue = oEvent.getSource().getValue();

            // Load the Value Help Dialog fragment
            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "auth.fragment.ValueHelpDialogPersonal",
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
            }

            // Open the Value Help Dialog and apply a filter based on the input value
            this._pValueHelpDialog.then(function (oValueHelpDialog) {
                oValueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
                    "personalnummer",
                    sap.ui.model.FilterOperator.StartsWith,
                    sInputValue
                )]);
                oValueHelpDialog.open();
            }.bind(this));
        },

        // Event handler for updating tokens in the multi-input field for personal numbers
        multiInputPersTokenUpdate: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts"),
                oMultiInput = this.byId("multiInputPers"),
                that = this;

            switch (oEvent.getParameter("type")) {
                case "added":
                    // Handle added tokens
                    oEvent.getParameter("addedTokens").forEach(oToken => {
                        that.aSelectedPersonal.push({
                            personalnummer: oToken.getText(),
                            Txtmd: ""
                        });
                    }, this);
                    break;
                case "removed":
                    // Handle removed tokens
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
                    // Handle other cases, e.g., when tokens are selected from the suggestion list
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
                        // Show a message toast with the selected personal numbers
                        var selectedValues = "Selected Personal Numbers: " + aContexts.map(function (oContext) {
                            var oSelectedObject = oContext.getObject();
                            return oSelectedObject.personalnummer;
                        }).join(", ");
                        sap.m.MessageToast.show(selectedValues);
                        // Reset the filter on the Value Help Dialog
                        oEvent.getSource().getBinding("items").filter([]);
                    }
                    break;
            }
            // Perform any additional validation logic
            this.createValidation();
        },

        // Event handler for Value Help Dialog close
        onValueHelpDialogClose: function (oEvent) {
            // Show a message toast indicating that the action was canceled
            sap.m.MessageToast.show("Action canceled");

            // Reset the filter on the Value Help Dialog
            oEvent.getSource().getBinding("items").filter([]);
        },

        // Event handler for searching personal numbers in the Value Help Dialog
        onSearchPersonal: function (oEvent) {
            var sValue = oEvent.getParameter("value"),
                // Create a filter based on the entered value
                oFilter = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sValue),
                oBinding = oEvent.getParameter("itemsBinding");
            // Apply the filter to the binding of the Value Help Dialog items
            oBinding.filter([oFilter]);
        },

        // Event handler for suggesting personal numbers in the Value Help Dialog
        suggestPersonalnummer: function (oEvent) {
            var sValue = oEvent.getParameter("suggestValue"),
                // Create a filter based on the suggested value
                oFilter = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sValue),
                oBinding = oEvent.getSource().getBinding("suggestionItems");
            // Apply the filter to the binding of the suggestion items
            oBinding.filter([oFilter]);
        },

        // Event handler for finishing the selection in the Value Help Dialog
        handleSelectionFinish: function (oEvent) {
            // Get the selected items from the Value Help Dialog
            var selectedItems = oEvent.getParameter("selectedItems");
            // Reset the array of selected phases
            this.aSelectedPhase = [];

            // Populate the array of selected phases with the selected items
            for (let i = 0; i < selectedItems.length; i++) {
                this.aSelectedPhase.push({
                    pla_pha: selectedItems[i].getText()
                });
            }

            // Perform any additional validation logic
            this.createValidation();
        },

        // Event handler for closing the view dialog
        onCloseViewDialog: function () {
            // Reset any model changes
            this._oModel.resetChanges();

            // Show a message toast indicating that the action was canceled
            sap.m.MessageToast.show("Action canceled");

            // Reset selected keys in the phase selection control
            this.byId("selectphase1").setSelectedKeys(null);

            // Remove all tokens and clear the input value in the multi-input field
            this.byId("multiInputPers").removeAllTokens();
            this.byId("multiInputPers").setValue("");

            // Remove all items from the table starting from the second item
            var aItems = this.byId("table2").getItems();
            for (let i = 1; i < aItems.length; i++) {
                this.byId("table2").removeItem(aItems[i]);
            }

            // Close the dialog
            this.oDialog.close();
        },

        // Event handler for opening the dialog
        onOpenDialog: function () {
            // Load the fragment for the input fields if not loaded yet
            if (!this._oDialogCRUD) {
                this._oDialogCRUD = this.loadFragment({
                    name: "auth.fragment.InputFieldsHAUPLPHA",
                    controller: this
                });
            }

            // Open the dialog
            this._oDialogCRUD.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();

                // Set a model for distinct phase items in the phase selection control
                var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                    distinctItems1: this.aPhase
                });
                this.byId("selectphase1").setModel(oDistinctModel1);
            }.bind(this));
        },

        // Function to perform validation and enable/disable buttons based on conditions
        createValidation: function () {
            // Get items from the table
            var aItems = this.getView().byId("table2").getItems();

            // Enable/disable buttons based on the number of items in the table
            if (aItems.length > 1) {
                this.byId("createButton").setEnabled(true);
                this.byId("deleteButton2").setEnabled(true);
            } else {
                this.byId("createButton").setEnabled(false);
                this.byId("deleteButton2").setEnabled(false);
            }

            // Enable/disable the "Add" button based on the selected phase and personal values
            if (this.aSelectedPhase !== '' && this.aSelectedPersonal !== '') {
                this.byId("addButton2").setEnabled(true);
            } else {
                this.byId("addButton2").setEnabled(false);
            }
        },

        // Event handler for the "Add" button press
        onAddPress2: function () {
            // Create a template array for new assignments
            var aTemplate = [],
                aItems = this.byId("table1").getItems(),
                that = this;

            // Populate the template array with selected phase and personal values
            this.aSelectedPhase.forEach(phase => {
                that.aSelectedPersonal.forEach(personal => {
                    aTemplate.push({
                        pla_pha: phase.pla_pha,
                        personalnummer: personal.personalnummer
                    });
                });
            });

            try {
                var oTable = this.byId("table2"),
                    bAssigExist = false,
                    aAssigExist = [],
                    aAssigOK = [],
                    aColumnListItems = [];

                // Check for existing assignments and valid assignments
                aTemplate.forEach((item, index) => {
                    var bAssigExist1 = false;
                    for (var i = 0; i < aItems.length; i++) {
                        if (item.pla_pha === aItems[i].getCells()[0].getTitle() &&
                            item.personalnummer === aItems[i].getCells()[1].getTitle()) {
                            bAssigExist = true;
                            bAssigExist1 = true;
                            aAssigExist.push({
                                pla_pha: item.pla_pha,
                                personalnummer: item.personalnummer
                            });
                            break;
                        }
                    }
                    if (!bAssigExist1) {
                        aAssigOK.push({
                            pla_pha: item.pla_pha,
                            personalnummer: item.personalnummer
                        });
                    }
                });

                // Handle existing assignments
                if (bAssigExist) {
                    var sMessage = "The following assignments already exist:\n\n";
                    aAssigExist.forEach(function (item) {
                        sMessage += "Phase: " + item.pla_pha + " => Personalnummer: " + item.personalnummer + "\n";
                    });
                    sap.m.MessageBox.warning(sMessage);
                }

                // Handle valid assignments
                aAssigOK.forEach(function (item) {
                    var oColumnListItem = new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: item.pla_pha }),
                            new sap.m.Text({ text: item.personalnummer })
                        ]
                    });
                    aColumnListItems.push(oColumnListItem);
                }, this);

                // Add valid assignments to the table
                aColumnListItems.forEach(function (oColumnListItem) {
                    oTable.addItem(oColumnListItem);
                });

                // Show a message toast for successful addition
                sap.m.MessageToast.show("Element successfully added");

                // Reset selected keys, tokens, and arrays
                this.byId("selectphase1").setSelectedKeys(null);
                this.byId("multiInputPers").removeAllTokens();
                this.aSelectedPhase = [];
                this.aSelectedPersonal = [];

                // Perform validation
                this.createValidation();
            } catch (error) {
                // Handle errors (e.g., duplicated key or empty fields)
                if (error.message === "DuplicatedKey") {
                    sap.m.MessageBox.warning("An element already exists");
                }
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning("No element can be added; empty fields are present");
                }
            }
        },

        // Event handler for the "Delete" button press
        onDeletePress2: function () {
            // Get the selected item from the table
            var oSelectedItem = this.byId("table2").getSelectedItem(),
                iIndex = this.byId("table2").indexOfItem(oSelectedItem);

            // Check if an item is selected
            if (oSelectedItem) {
                // Check if the selected item is the first item (cannot be deleted)
                if (iIndex == 0) {
                    sap.m.MessageBox.warning("This element cannot be deleted");
                }
                // Delete the selected item
                else {
                    oSelectedItem.destroy();
                    sap.m.MessageToast.show("Assignment successfully deleted");
                }
            } else {
                sap.m.MessageBox.warning("No element selected for deletion!");
            }

            // Perform validation
            this.createValidation();
        },

        // Event handler for the "Create" button press
        onCreatePress: function () {
            try {
                // Get the table and its items
                var oTable = this.getView().byId("table2"),
                    aItems = oTable.getItems(),
                    aCreate = [],
                    that = this,
                    fnSuccess = function () {
                        // Display success message when phase is successfully assigned
                        sap.m.MessageToast.show("Phase successfully assigned");
                    }.bind(this),
                    fnError = function (oError) {
                        // Display error message if there's an issue with the assignment
                        sap.m.MessageBox.error(oError.message);
                    }.bind(this);

                // Iterate through the items in the table (excluding the header)
                for (let i = 1; i < aItems.length; i++) {
                    // Extract data from each row and add it to the array
                    var aRow = [aItems[i].getCells()[0].getText(), aItems[i].getCells()[1].getText()];
                    aCreate.push(aRow);
                }

                // Iterate through the array of data to create assignments
                aCreate.forEach(item => {
                    that._oModel.create("/HAUPLPHA", {
                        pla_pha: item[0],
                        personalnummer: item[1]
                    }, {
                        success: fnSuccess,
                        error: fnError
                    });
                });

                // Remove the items from the table after successful creation
                for (var i = aItems.length - 1; i > 0; i--) {
                    oTable.removeItem(aItems[i]);
                }

                // Close the dialog and refresh the binding of the source table
                this.oDialog.close();
                this.byId("table1").getBinding("items").refresh();
            } catch (error) {
                // Handle errors (e.g., empty fields)
                if (error instanceof TypeError) {
                    sap.m.MessageBox.warning("No element can be added; empty fields are present");
                }
            }
        },

        // Event handler for the "Delete" button press
        onDeletePress: function () {
            var oSelectedItem = this.byId("table1").getSelectedItem(),
                fnSuccess = function () {
                    // Display success message when element is successfully deleted
                    sap.m.MessageToast.show("Element (" + sPersNummer + ") successfully deleted");
                },
                fnError = function (oError) {
                    // Display error message if there's an issue with the deletion
                    sap.m.MessageBox.error(oError.message);
                };

            if (oSelectedItem) {
                // Get the context and properties of the selected item
                var oContext = oSelectedItem.getBindingContext(),
                    sPersNummer = oContext.getProperty("personalnummer"),
                    sPhase = oContext.getProperty("pla_pha"),
                    sURL = "/HAUPLPHA(personalnummer='" + sPersNummer + "',pla_pha='" + sPhase + "')";

                // Remove the item from the model based on its URL
                this._oModel.remove(sURL, {
                    success: fnSuccess,
                    error: fnError
                });
            } else {
                // Display a warning if no item is selected for deletion
                sap.m.MessageBox.warning("No element selected for deletion");
            }
        },

        // Event handler for the search input field
        onSearch1: function (oEvent) {
            var aFilters = [],
                sQuery = oEvent.getSource().getValue();

            if (sQuery && sQuery.length > 0) {
                // Create filters based on the query for personalnummer and pla_pha
                var filter = new sap.ui.model.Filter([
                    new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("pla_pha", sap.ui.model.FilterOperator.Contains, sQuery)
                ], false);
                aFilters.push(filter);
            }

            // Apply the filters to the table's binding
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
        },

        // Function to get or load a view settings dialog fragment
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
            if (!pDialog) {
                // Load the fragment and store the promise in the map
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

        // Function to reset the grouping dialog
        resetGroupDialog: function (oEvent) {
            this.groupReset = true;
        },

        // Sorting functionality
        handleSortButtonPressed: function () {
            // Open the sort dialog when the sort button is pressed
            this.getViewSettingsDialog("auth.fragment.SortDialogHAUPLPHA")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm: function (oEvent) {
            // Handle confirmation of the sort dialog
            var mParams = oEvent.getParameters(),
                sort = oEvent.getParameter("sortItem"),
                aSorters = [];

            if (sort) {
                // Get sort parameters and apply sorting to the table
                var sPath = mParams.sortItem.getKey(),
                    bDescending = mParams.sortDescending;

                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                this.byId("table1").getBinding("items").sort(aSorters);
                this.byId("sortUsersButton").setType("Emphasized");
            } else
                this.byId("sortUsersButton").setType("Default");
        },

        // Filtering functionality
        handleFilterButtonPressed: function () {
            // Open the filter dialog when the filter button is pressed
            this.getViewSettingsDialog("auth.fragment.FilterDialogHAUPLPHA")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleFilterDialogConfirm: function (oEvent) {
            // Handle confirmation of the filter dialog
            var mParams = oEvent.getParameters(),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                // Get filter parameters and apply filtering to the table
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

        // Grouping functionality
        handleGroupButtonPressed: function () {
            // Open the group dialog when the group button is pressed
            this.getViewSettingsDialog("auth.fragment.GroupDialogHAUPLPHA")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleGroupDialogConfirm: function (oEvent) {
            // Handle confirmation of the group dialog
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                vGroup,
                aGroups = [];

            if (mParams.groupItem) {
                // Get group parameters and apply grouping to the table
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];
                aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

                this.byId("table1").getBinding("items").sort(aGroups);
                this.byId("groupButton").setType("Emphasized");
            } else if (this.groupReset) {
                // Reset grouping if the groupReset flag is set
                this.byId("table1").getBinding("items").sort();
                this.byId("groupButton").setType("Default");
                this.groupReset = false;
            }
        },

        // Function to create configuration for Excel columns
        createColumnConfig: function () {
            var aCols = [];

            // Define columns with properties and types
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

        // Event handler for the "Export" button press
        onExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            // Get the table and its binding
            if (!this._oTable) {
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');

            // Create column configuration
            aCols = this.createColumnConfig();

            // Define export settings
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Table export HAUPLPHA.xlsx',
                worker: false
            };

            // Create a new spreadsheet object and initiate the export
            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        }

    });
});
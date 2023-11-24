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
        // Initialization function called when the view is created
        onInit: function () {
            // Set the language to German for the application
            // sap.ui.getCore().getConfiguration().setLanguage("de");

            // Get the OData model from the owner component
            this._oModel = this.getOwnerComponent().getModel();

            // Initialize arrays and objects used in the view
            this.aValue = [];
            this._mViewSettingsDialogs = {};
            this.mGroupFunctions = {};

            // Get references to various UI elements
            this._oPage = this.byId("dynamicPage1");
            this.oFilterBar = this.getView().byId("filterbar");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oTable = this.getView().byId("table1");

            // Bind functions to maintain the correct 'this' context
            this.applyData = this.applyData.bind(this);
            this.fetchData = this.fetchData.bind(this);
            this.getFiltersWithValues = this.getFiltersWithValues.bind(this);
            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            // Function to retrieve data for the "PERSONAL_DIST" entity
            var that = this,
                iSkip = 0;

            function getPers() {
                that._oModel.read("/PERSONAL_DIST", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            that.aValue = that.aValue.concat(oData.results);
                        }
                        if (oData.results.length === 5000) {
                            iSkip += 5000;
                            getPers();
                        } else {
                            // Remove duplicates based on 'personalnummer'
                            var aDistinctItems = that.aValue.reduce(function (aUnique, oItem) {
                                if (!aUnique.some(function (obj) { return obj.personalnummer === oItem.personalnummer; })) {
                                    aUnique.push(oItem);
                                }
                                return aUnique;
                            }, []);

                            // Create and set JSONModel for distinct items
                            var oDistinctModel = new sap.ui.model.json.JSONModel({
                                distinctItems: aDistinctItems
                            });
                            oDistinctModel.setSizeLimit(2000);

                            that.getView().byId("multiPersonal").setModel(oDistinctModel);

                            // Release the busy state of the page
                            that._oPage.setBusy(false);
                            return;
                        }
                    },
                    error: function (errorEntit1) {
                        console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
                    }
                });
            }
            getPers();

            // this._oPage.setBusy(false);

            // var oModel = this.getOwnerComponent().getModel();

            /* function getData() {
                that._oModel.read("/HAUKB001", {
                    urlParameters: {
                        "$top": 5000,
                        "$skip": iSkip
                    },
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            that.aValue = that.aValue.concat(oData.results);
                        }
                        if (oData.results.length === 5000) {
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

                            aDistinctItems2.sort(function (a, b) {
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

                            var aDistinctItems3 = that.aValue.reduce(function (aUnique, oItem) {
                                if (oItem.org_einh !== "") {
                                    if (!aUnique.some(function (obj) { return obj.org_einh === oItem.org_einh; })) {
                                        aUnique.push(oItem);
                                    }
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems4 = that.aValue.reduce(function (aUnique, oItem) {
                                if (oItem.typ !== "") {
                                    if (!aUnique.some(function (obj) { return obj.typ === oItem.typ; })) {
                                        aUnique.push(oItem);
                                    }
                                }
                                return aUnique;
                            }, []);

                            var aDistinctItems5 = that.aValue.reduce(function (aUnique, oItem) {
                                if (oItem.entit !== "") {
                                    if (!aUnique.some(function (obj) { return obj.entit === oItem.entit; })) {
                                        aUnique.push(oItem);
                                    }
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
                            oDistinctModel.setSizeLimit(1000);
                            var oDistinctModel1 = new sap.ui.model.json.JSONModel({
                                distinctItems1: aDistinctItems1
                            });
                            var oDistinctModel2 = new sap.ui.model.json.JSONModel({
                                distinctItems2: aDistinctItems2
                            });
                            var oDistinctModel3 = new sap.ui.model.json.JSONModel({
                                distinctItems3: aDistinctItems3
                            });
                            oDistinctModel3.setSizeLimit(1000);
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
                            oDistinctModel7.setSizeLimit(2000);

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
            getData(); */

        },
        // Event handler for navigation button press
        onNavButtonPressed: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome");
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
                return this.getI18nText("expandedContent");
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
                return this.getI18nText("expandedContent");
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
        // Function to cancel entry dialog and reset model changes
        onCancelEntryDialog: function () {
            // Reset model changes
            this._oModel.resetChanges();

            // Show a message toast indicating the action is canceled
            sap.m.MessageToast.show(this.getI18nText("actionCancel"));

            // Hide and reset input fields in the entry dialog
            this.byId("cleanEntryFilter").setVisible(false);
            this.byId("entryPersonal").setValue("");
            this.byId("entryDatamart").setValue("");
            this.byId("entryFunktion").setValue("");

            // Close the dialog
            this.oDialog.close();
        },

        // Function to clean entry filter and show a message toast
        onCleanEntryFilterPress: function () {
            // Remove filters from the table binding
            var aFilters = [];
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

            // Hide the "Clean Entry Filter" button
            this.byId("cleanEntryFilter").setVisible(false);

            // Show a message toast indicating the initial filter is removed
            sap.m.MessageToast.show(this.getI18nText("initialFilterRemoved"));
        },

        // Function to open the entry dialog
        onOpenEntryDialog: function () {
            // Check if the entry dialog is not already loaded
            if (!this._oDialogEntry) {
                // Load the entry dialog fragment
                this._oDialogEntry = this.loadFragment({
                    name: "authorization.fragment.EntryDialogHAUKB001",
                    controller: this
                });
            }
            // Open the entry dialog
            this._oDialogEntry.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();
            }.bind(this));
        },

        // Function to handle entry filter press
        onEntryFilterPress: function () {
            // Array to store filters
            var aFilters = [],
                // Get values from input fields
                iPersonalnummer = this.byId("entryPersonal").getValue().toString(),
                sDatamart = this.byId("entryDatamart").getValue(),
                iFunktion = this.byId("entryFunktion").getValue().toString(),
                // Create filters based on input values
                fPersonalnummer = new sap.ui.model.Filter("personalnummer", sap.ui.model.FilterOperator.Contains, iPersonalnummer),
                fDatamart = new sap.ui.model.Filter("datamart", sap.ui.model.FilterOperator.Contains, sDatamart),
                fFunktion = new sap.ui.model.Filter("funktion", sap.ui.model.FilterOperator.Contains, iFunktion);

            // Add filters to the array if values are provided
            if (iPersonalnummer) {
                aFilters.push(fPersonalnummer);
            }
            if (sDatamart) {
                aFilters.push(fDatamart);
            }
            if (iFunktion) {
                aFilters.push(fFunktion);
            }

            // Apply combined filter if filters are present
            if (aFilters.length > 0) {
                var combFilter = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: true
                });
                this.byId("table1").getBinding("items").filter(combFilter, sap.ui.model.FilterType.Application);
                this.byId("cleanEntryFilter").setVisible(true);
                console.log(combFilter);
            }

            // Show toast message and reset input values
            sap.m.MessageToast.show(this.getI18nText("filterOn"));
            this.byId("entryPersonal").setValue("");
            this.byId("entryDatamart").setValue("");
            this.byId("entryFunktion").setValue("");
            // Close the dialog
            this.oDialog.close();
        },

        // Function to perform input validation for entry fields
        entryValidation: function () {
            // Get values from input fields
            var iPersonalnummer = this.byId("entryPersonal").getValue(),
                sDatamart = this.byId("entryDatamart").getValue(),
                iFunktion = this.byId("entryFunktion").getValue(),
                oPersonalnummer = this.byId("entryPersonal"),
                oDatamart = this.byId("entryDatamart"),
                oFunktion = this.byId("entryFunktion"),
                flag = false;

            // Helper function to check if the input is valid (not a number and length <= 2)
            function isValid(input) {
                return isNaN(input) && input.length <= 2;
            }

            // Check if at least one of the inputs has a value
            if (iPersonalnummer.length > 0 || sDatamart.length > 0 || iFunktion.length > 0) {
                flag = true;
            } else {
                flag = false;
            }

            // Validation for individual inputs
            if (iPersonalnummer.length < 6 && iPersonalnummer.length > 0) {
                oPersonalnummer.setValueState(sap.ui.core.ValueState.None); // No error
            } else {
                oPersonalnummer.setValueState(sap.ui.core.ValueState.Error); // Set error state
            }
            if (isNaN(sDatamart) && sDatamart.length < 3) {
                oDatamart.setValueState(sap.ui.core.ValueState.None); // No error
            } else {
                oDatamart.setValueState(sap.ui.core.ValueState.Error); // Set error state
            }
            if (iFunktion.length < 3 && iFunktion.length > 0) {
                oFunktion.setValueState(sap.ui.core.ValueState.None); // No error
            } else {
                oFunktion.setValueState(sap.ui.core.ValueState.Error); // Set error state
            }

            // Set None state for default (no error) when inputs are empty
            if (iPersonalnummer == '') {
                oPersonalnummer.setValueState(sap.ui.core.ValueState.None);
            }
            if (sDatamart == '') {
                oDatamart.setValueState(sap.ui.core.ValueState.None);
            }
            if (iFunktion == '') {
                oFunktion.setValueState(sap.ui.core.ValueState.None);
            }

            // Validation for all inputs and enable/disable entry button based on conditions
            if (flag &&
                ((iPersonalnummer.length <= 5 || !iPersonalnummer) &&
                    (isValid(sDatamart) || !sDatamart) &&
                    (iFunktion.length <= 2 || !iFunktion))) {
                this.byId("entryButton").setType("Emphasized"); // Enable entry button
            } else {
                this.byId("entryButton").setType("Default"); // Disable entry button
            }
        },

        // Function to handle search event in table1
        onSearch1: function (oEvent) {
            // Array to store filters
            var aFilters = [];

            // Get the search query from the input field
            var sQuery = oEvent.getSource().getValue();

            // Check if there is a search query
            if (sQuery && sQuery.length > 0) {
                // Create a filter with multiple conditions based on the search query
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

                // Add the filter to the array
                aFilters.push(filter);
            }

            // Apply filters to the table1 binding
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
        },

        // Function to get or load the view settings dialog based on the fragment name
        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            // Check if the dialog is already loaded
            if (!pDialog) {
                // Load the dialog as a fragment
                pDialog = sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    return oDialog;
                });

                // Store the loaded dialog in a map for reuse
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }

            // Return the dialog
            return pDialog;
        },

        // Function to reset the group dialog settings
        resetGroupDialog: function (oEvent) {
            console.log("reset");
            this.groupReset = true;
        },

        // Function to handle the press event of the sort button
        handleSortButtonPressed: function () {
            // Open the view settings dialog for sorting
            this.getViewSettingsDialog("authorization.fragment.SortDialogHAUKB001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Function to handle the press event of the filter button
        handleFilterButtonPressed: function () {
            // Open the view settings dialog for filtering
            this.getViewSettingsDialog("authorization.fragment.FilterDialogHAUKB001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Function to handle the press event of the group button
        handleGroupButtonPressed: function () {
            // Open the view settings dialog for grouping
            this.getViewSettingsDialog("authorization.fragment.GroupDialogHAUKB001")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        // Function to handle sorting in the table based on user's selection
        handleSortDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sort = oEvent.getParameter("sortItem"),
                aSorters = [];

            // Check if a sort item is selected
            if (sort) {
                var sPath = mParams.sortItem.getKey(),
                    bDescending = mParams.sortDescending;

                // Create a sorter based on user's selection
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                this.byId("sortUsersButton").setType("Emphasized");
            } else {
                // If no sort item selected, set default button type
                this.byId("sortUsersButton").setType("Default");
            }

            // Apply sorting to the table
            this.byId("table1").getBinding("items").sort(aSorters);
        },

        // Function to handle filtering in the table based on user's selection
        handleFilterDialogConfirm: function (oEvent) {
            var mParams = oEvent.getParameters(),
                aFilters = [];

            // Loop through selected filter items
            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sValue = aSplit[1];

                // Create a filter based on user's selection
                var oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.Contains, sValue);
                aFilters.push(oFilter);
            });

            // Apply filters to the table
            this.byId("table1").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);

            // Set button type based on the presence of filters
            var filters = oEvent.getParameter("filterItems");
            if (filters.length > 0) {
                this.byId("filterButton").setType("Emphasized");
            } else {
                this.byId("filterButton").setType("Default");
            }
        },

        // Function to handle grouping in the table based on user's selection
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

                // Create a sorter for grouping based on user's selection
                aGroups.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));

                // Set button type for emphasis
                this.byId("groupButton").setType("Emphasized");

                // Apply grouping to the table
                this.byId("table1").getBinding("items").sort(aGroups);
            } else if (this.groupReset) {
                // If group reset is needed, reset grouping and set default button type
                this.byId("table1").getBinding("items").sort();
                this.byId("groupButton").setType("Default");
                this.groupReset = false;
            }
        },

        // Function to create column configuration for export
        createColumnConfig: function () {
            var aCols = [];

            // Define columns with properties and types for export
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

        // Function to handle the export of data to a spreadsheet
        onExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            // Check if the table reference exists, otherwise get it from the view
            if (!this._oTable) {
                this._oTable = this.byId("table1");
            }
            oTable = this._oTable;

            // Get the row binding and create column configuration
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            // Set up export settings
            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'HAUKB001.xlsx',
                worker: false
            };

            // Create and build the spreadsheet
            oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        }

    });
});
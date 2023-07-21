sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/UIComponent",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/ColumnListItem",
	"sap/m/Input",
	"sap/m/BusyDialog"
], function (
	Controller,
	MessageToast,
	MessageBox,
	Fragment,
	JSONModel,
	BindingMode,
	UIComponent,
	Select,
	Text,
	ColumnListItem,
	Input,
	BusyDialog
) {
	"use strict";

	return Controller.extend("authorization.controller.Wizard", {
		/**
		 * @override
		 */
		onInit: function () {
			//Controller.prototype.onInit.apply(this, arguments);
			this._oModel = this.getOwnerComponent().getModel();
			sap.ui.getCore().getConfiguration().setLanguage("de");
			this._oWizard = this.byId("createWizard");
			this.aDatamart = [];
			//  this.aFunktion = [];
			this.aFiltersCube = [];
			this.setStep1 = [];
			this.setStep2 = [];
			this.setStep3 = [];
			this.setStep4 = [];
			this.setFunction = [];
		},
		onNavButtonPressed: function () {
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RouteHome");
		},
		discardProgress: function () {
			var aSteps = this._oWizard.getSteps(),
				oTable1 = this.getView().byId("table1"),
				aItems1 = oTable1.getItems(),
				oTable2 = this.getView().byId("table2"),
				aItems2 = oTable2.getItems(),
				oTable3 = this.getView().byId("table3"),
				aItems3 = oTable3.getItems(),
				oTable4 = this.getView().byId("table4"),
				aItems4 = oTable4.getItems();

			aSteps.forEach(function (oStep) {
				oStep.setValidated(false);
			});

			for (var i = aItems1.length - 1; i > 0; i--) {
				oTable1.removeItem(aItems1[i]);
			}
			for (var i = aItems2.length - 1; i > 0; i--) {
				oTable2.removeItem(aItems2[i]);
			}
			for (var i = aItems3.length - 1; i > 0; i--) {
				oTable3.removeItem(aItems3[i]);
			}
			for (var i = aItems4.length - 1; i > 0; i--) {
				oTable4.removeItem(aItems4[i]);
			}
			this.byId("inputTxtSh").setValue("");
			this.byId("inputTxtMd").setValue("");
			this.byId("inputTxtLg").setValue("");
			this.byId("datamartText").setText("");
			this.byId("inputDatamart").setValue("");
			this.byId("selectMulti").setSelectedKey(null);

			this.byId("selectInfoAuthName").setSelectedKey(null);
			this.byId("selectCube").setSelectedKey(null);
			this.byId("selectIobj").setSelectedKey(null);
			this.byId("inputInfoTyp").setValue("");
			this.byId("selectSequenz").setSelectedKey(null);

			this.byId("inputFuntkion").setValue("");
			this.byId("selecttyp").setSelectedKey(null);
			this.byId("inputentit").setValue("");
			this.byId("inputwert").setValue("");

			this.byId("selectpersonalnummer").setSelectedKey(null);
			this.byId("selectfunktion").setSelectedKey(null);
			this.setStep1 = [];
			this.setStep2 = [];
			this.setStep3 = [];
			this.setStep4 = [];

			this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
		},
		handleWizardCancel: function () {
			this.discardProgress();
			sap.m.MessageToast.show("Aktion abgebrochen");
			this.getRouter().navTo("RouteHome");
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		selectDatamartValidation: function () {
			var sInput1 = this.byId("inputDatamart").getValue();
			if (sInput1.length == 2)
				this.byId("datamartText").setText(sInput1);
		},
		wizardCompleteHandler: function () {
			var sMessage = "Sind Sie sicher, dass Sie diese Elemente erstellen wollen?";
			sap.m.MessageBox.show(sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				title: "Bestätigung ",
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						var iBusyDuration = 5000,
							oWizard = this.byId("createWizard"),
							oBusyDialog = new BusyDialog({
								title: "Elemente erstellen....",
								text: "Die neuen Berechtigungselemente werden nun erstellt. \n Bitte warten Sie einen Moment"
							});

						var aSteps = this._oWizard.getSteps();

						oBusyDialog.open();
						oWizard.setBusy(true);

						setTimeout(function () {
							oWizard.setBusy(false);
							oBusyDialog.close();
							sap.m.MessageToast.show("Aktion erfolgreich abgeschlossen");
						}, iBusyDuration);

						this.discardProgress();
						this.getRouter().navTo("RouteHome");
					} else {
						sap.m.MessageToast.show("Aktion abgebrochen");
					}
				}.bind(this)
			});
		},

		// onSelectIobjAuthChange: function () {

		// 	var selectAuthIOBJ = this.byId("selectInfoAuthName").getSelectedItem().getText(),
		// 		filterAuthIOBJ = new sap.ui.model.Filter("Iobjnm", sap.ui.model.FilterOperator.EQ, selectAuthIOBJ);


		// 	var aFilters = this.aDatamart.map(function (sValue) {
		// 		return new sap.ui.model.Filter("Iobjnm", sap.ui.model.FilterOperator.EQ, sValue);
		// 	});

		// 	aFilters.push(filterAuthIOBJ);

		// 	if (!this._oCubeSelect) {
		// 		this._oCubeSelect = this.loadFragment({
		// 			name: "authorization.fragment.SelectCube",
		// 			controller: this
		// 		});
		// 	}
		// 	this._oCubeSelect.then(function (oCube) {
		// 		this.oCubeSelect = oCube;
		// 		this.getView().addDependent(this.oCubeSelect);
		// 		this.byId("myTable").getBinding("items").filter(aFilters, sap.ui.model.FilterType.Application);
		// 		// this.oCubeSelect.open();

		// 	}.bind(this));
		// 	this.aFiltersCube = aFilters;
		// },

		handleDeleteDuplicatedOnSelect: function (selectId) {
			var oSelect = this.getView().byId(selectId);

			var aItems = oSelect.getItems();
			var aUniqueItems = aItems.reduce(function (acc, item) {
				var key = item.getKey();
				if (!acc.some(function (accItem) { return accItem.getKey() === key; })) {
					acc.push(item);
				}
				return acc;
			}, []);

			oSelect.removeAllItems();
			aUniqueItems.forEach(function (item) {
				oSelect.addItem(item);
			});
		},

		handleSearch: function (oEvent) {
			var aFilters = [],
				aFilters2 = [],
				sQuery = oEvent.getParameter("value"),
				aFilters1 = this.aFiltersCube;

			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter([
					new sap.ui.model.Filter("Partcube", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("Iobjnm", sap.ui.model.FilterOperator.Contains, sQuery)
				], false);
				aFilters.push(filter);
			}
			aFilters2 = aFilters1.concat(aFilters);
			this.byId("myTable").getBinding("items").filter(aFilters2, sap.ui.model.FilterType.Application);
		},
		handleConfirm: function (oEvent) {
			var oBinding = oEvent.getSource().getBinding("items"),
				oSelectedItem = oEvent.getParameter("selectedItem"),
				oContext = oSelectedItem.getBindingContext(),
				oSelectedData = oContext.getObject(),
				sPartCube = oSelectedData.Partcube,
				sIobj = oSelectedData.Iobjnm;

			// this.byId("selectCube").setText(sPartCube);
			// this.byId("selectIobj").setText(sIobj);

			oBinding.filter([]);
		},
		selectFunktion: function (sFunktion) {
			if (this.setFunction.includes(sFunktion)) {
				return
			}
			this.setFunction.push(sFunktion);
			var oSelect = this.byId("selectfunktion"),
				oItem = new sap.ui.core.Item({
					text: sFunktion
				});
			oSelect.addItem(oItem);
		},
		onAddPress1: function () {
			try {
				var oTable = this.byId("table1"),
					oTemplate = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({ text: this.byId("inputDatamart").getValue() }),
						new sap.m.Text({ text: this.byId("selectMulti").getSelectedItem().getText() })]
					});
				if (this.byId("inputDatamart").getValueState() != sap.ui.core.ValueState.None ||
					this.byId("inputTxtMd").getValueState() != sap.ui.core.ValueState.None)
					throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");
				if (this.byId("inputTxtSh").getValueState() != sap.ui.core.ValueState.None ||
					this.byId("inputTxtMd").getValueState() != sap.ui.core.ValueState.None ||
					this.byId("inputTxtLg").getValueState() != sap.ui.core.ValueState.None)
					throw new sap.ui.base.Exception("TextFieldException", "Falsche Definition");
				this.setStep1.forEach(element => {
					if (element[0] == this.byId("inputDatamart").getValue() &&
						element[1] == this.byId("selectMulti").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DupicatedKey", "Das Element ist vorhanden");
					}
				});
				oTable.addItem(oTemplate);
				this.setStep1.push([this.byId("inputDatamart").getValue(), this.byId("selectMulti").getSelectedItem().getText()]);
				this.aDatamart.push(this.byId("selectMulti").getSelectedItem().getText());
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");
				this.byId("selectMulti").setSelectedKey(null);
				this.step1validation();
				this.handleDeleteDuplicatedOnSelect("selectCube");
				this.handleDeleteDuplicatedOnSelect("selectIobj");
			} catch (error) {
				if (error.message == "EmptyFieldException")
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
				if (error.message == "TextFieldException")
					sap.m.MessageBox.warning("Problem mit Textbeschreibungen");
				if (error.message == "DupicatedKey")
					sap.m.MessageBox.warning("Das Element ist vorhanden");
				if (error instanceof TypeError)
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
			}
		},
		onAddPress2: function () {
			try {
				var auth_flag = false;
				var oTable = this.byId("table2"),
					oTemplate = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({ text: this.byId("selectInfoAuthName").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("selectCube").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("selectIobj").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("inputInfoTyp").getValue() }),
						new sap.m.Text({ text: this.byId("selectSequenz").getSelectedItem().getText() })]
					});
				this.setStep2.forEach(element => {
					if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[2] == this.byId("selectIobj").getSelectedItem().getText() &&
						element[3] == this.byId("inputInfoTyp").getValue() &&
						element[4] == this.byId("selectSequenz").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DupicatedKey", "Falsche Definition");
					} if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[2] == this.byId("selectIobj").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DupicatedPKey", "Falsche Definition");
					} if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[3] != this.byId("inputInfoTyp").getValue()) {
						throw new sap.ui.base.Exception("AuthTypeError", "Falsche Definition");
					} if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[4] == this.byId("selectSequenz").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("SequenseError", "Falsche Definition");
					} if (element[3] == this.byId("inputInfoTyp").getValue()) {
						if (element[1] == this.byId("selectCube").getSelectedItem().getText())
							auth_flag = true;
						else {
							for (var item of this.setStep2) {
								if (item[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
									item[2] == this.byId("selectIobj").getSelectedItem().getText() &&
									item[4] == this.byId("selectSequenz").getSelectedItem().getText() &&
									item[1] != this.byId("selectCube").getSelectedItem().getText() &&
									item[3] == this.byId("inputInfoTyp").getValue()) {
									auth_flag = true;
								}
							}
						}
					} else
						auth_flag = true;
					if (!auth_flag) {
						throw new sap.ui.base.Exception("SameTypeError", "Falsche Definition");
					}
				});
				oTable.addItem(oTemplate);
				this.setStep2.push([this.byId("selectInfoAuthName").getSelectedItem().getText(),
				this.byId("selectCube").getSelectedItem().getText(),
				this.byId("selectIobj").getSelectedItem().getText(),
				this.byId("inputInfoTyp").getValue(),
				this.byId("selectSequenz").getSelectedItem().getText()]);
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");
				this.step2validation();
				this.byId("selectInfoAuthName").setSelectedKey(null);
				this.byId("selectCube").setSelectedKey(null);
				this.byId("selectIobj").setSelectedKey(null);
				this.byId("inputInfoTyp").setValue("");
				this.byId("selectSequenz").setSelectedKey(null);
			} catch (error) {
				if (error.message == "DupicatedKey")
					sap.m.MessageBox.warning("Das Element ist vorhanden");
				if (error.message == "DupicatedPKey")
					sap.m.MessageBox.warning("Für dieses Cube-Infobjekt existiert bereits eine Berechtigung");
				if (error.message == "AuthTypeError")
					sap.m.MessageBox.warning("Für diese Genehmigung gibt es bereits einen Typ");
				if (error.message == "SequenseError")
					sap.m.MessageBox.warning("Für diese Berechtigung existiert bereits eine Sequenz mit diesem Wert");
				if (error.message == "SameTypeError")
					sap.m.MessageBox.warning("Bei einem vorhandenen Typ muss die Konfiguration in den verschiedenen Würfeln gleich sein.");
				if (error instanceof TypeError)
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
			}
		},
		onAddPress3: function () {
			try {
				var auth_flag = false;
				var oTable = this.byId("table3"),
					oTemplate = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({ text: this.byId("inputFuntkion").getValue() }),
						new sap.m.Text({ text: this.byId("selecttyp").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("inputentit").getValue() }),
						new sap.m.Text({ text: this.byId("inputwert").getValue() })]
					});
				if (this.byId("inputFuntkion").getValue() == "" || this.byId("selecttyp").getSelectedKey() == null ||
					this.byId("inputentit").getValue() == "" || this.byId("inputwert").getValue() == "")
					throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");
				this.setStep3.forEach(element => {
					if (element[0] == this.byId("inputFuntkion").getValue() &&
						element[1] == this.byId("selecttyp").getSelectedItem().getText() &&
						element[2] == this.byId("inputentit").getValue() &&
						element[3] == this.byId("inputwert").getValue()) {
						throw new sap.ui.base.Exception("DupicatedKey", "Falsche Definition");
					} if (this.byId("selecttyp").getSelectedItem().getText() != "D") {
						this.setStep3.forEach(item => {
							if (item[0] == this.byId("inputFuntkion").getValue() &&
								item[1] === "D") {
								auth_flag = true;
							}
						});
					} else {
						auth_flag = true;
					}
				});
				if (!auth_flag && this.byId("selecttyp").getSelectedItem().getText() != "D")
					throw new sap.ui.base.Exception("NoDatamartException", "Falsche Definition");
				oTable.addItem(oTemplate);
				this.setStep3.push([this.byId("inputFuntkion").getValue(),
				this.byId("selecttyp").getSelectedItem().getText(),
				this.byId("inputentit").getValue(),
				this.byId("inputwert").getValue()]);
				this.selectFunktion(this.byId("inputFuntkion").getValue());
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");
				this.step3validation();
				this.byId("inputFuntkion").setValue("");
				this.byId("selecttyp").setSelectedKey(null);
				this.byId("inputentit").setValue("");
				this.byId("inputwert").setValue("");
			} catch (error) {
				if (error.message == "EmptyFieldException")
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
				if (error.message == "DupicatedKey")
					sap.m.MessageBox.warning("Das Element ist vorhanden");
				if (error.message == "NoDatamartException")
					sap.m.MessageBox.warning("Die Funktion, die Sie erstellen möchten, hat keinen Datamart (D)-Typ, der mit ihr verbunden ist");
				if (error instanceof TypeError)
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
			}
		},
		onAddPress4: function () {
			try {
				var oTable = this.byId("table4"),
					oTemplate = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({ text: this.byId("selectpersonalnummer").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("selectfunktion").getSelectedItem().getText() })]
					});
				this.setStep4.forEach(element => {
					if (element[0] == this.byId("selectpersonalnummer").getSelectedItem().getText() &&
						element[1] == this.byId("selectfunktion").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DupicatedKey", "Das Element ist vorhanden");
					}
				});
				oTable.addItem(oTemplate);
				this.setStep4.push([this.byId("selectpersonalnummer").getSelectedItem().getText(), this.byId("selectfunktion").getSelectedItem().getText()])
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");
				this.step4validation();
				this.byId("selectpersonalnummer").setSelectedKey(null);
				this.byId("selectfunktion").setSelectedKey(null);
			} catch (error) {
				if (error instanceof TypeError) {
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
				}
				if (error.message == "DupicatedKey") {
					sap.m.MessageBox.warning("Das Element ist vorhanden");
				}
			}
		},
		onDeletePress1: function () {
			var oSelectedItem = this.byId("table1").getSelectedItem(),
				iIndex = this.byId("table1").indexOfItem(oSelectedItem);
			if (oSelectedItem) {
				if (iIndex == 0) {
					sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
				}
				else {
					iIndex -= 1;
					this.aDatamart.splice(iIndex, 1);
					this.setStep1.splice(iIndex, 1);
					oSelectedItem.destroy();
					sap.m.MessageToast.show("Element erfolgreich gelöscht");
				}
			} else {
				sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt!");
			}
			this.step1validation();
		},
		onDeletePress2: function () {
			var oSelectedItem = this.byId("table2").getSelectedItem(),
				iIndex = this.byId("table2").indexOfItem(oSelectedItem);

			if (oSelectedItem) {
				if (iIndex == 0) {
					sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
				}
				else {
					this.setStep2.splice(iIndex - 1, 1);
					oSelectedItem.destroy();
					sap.m.MessageToast.show("Element erfolgreich gelöscht");
				}
			} else {
				sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt!");
			}
			this.step2validation();
		},
		onDeletePress3: function () {
			var oSelectedItem = this.byId("table3").getSelectedItem(),
				iIndex = this.byId("table3").indexOfItem(oSelectedItem),
				oSelect = this.getView().byId("selectfunktion"),
				aItems = oSelect.getItems();
			// aCells = oSelectedItem.getCells(),
			// sTextValue = aCells[0].getText();

			if (oSelectedItem) {
				if (iIndex == 0) {
					sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
				}
				else {
					iIndex -= 1;
					this.setStep3.splice(iIndex, 1);

					if (iIndex >= 0 && iIndex < aItems.length) {
						oSelect.removeItem(aItems[iIndex]);
					}
					oSelectedItem.destroy();
					sap.m.MessageToast.show("Element erfolgreich gelöscht");
					this.step3validation();
					this.byId("selectfunktion").removeAllItems();
					this.setFunction = [];
					this.setStep3.forEach(item => {
						this.selectFunktion(item[0]);
					});
				}
			} else {
				sap.m.MessageBox.warning("Kein Element zum Löschen ausgewählt!");
			}
			this.step3validation();
		},
		onDeletePress4: function () {
			var oSelectedItem = this.byId("table4").getSelectedItem(),
				iIndex = this.byId("table4").indexOfItem(oSelectedItem);
			if (oSelectedItem) {
				if (iIndex == 0) {
					sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
				}
				else {
					this.setStep4.splice(iIndex - 1, 1);
					oSelectedItem.destroy();
					sap.m.MessageToast.show("Element erfolgreich gelöscht");
				}
			} else {
				sap.m.MessageBox.warning("kein Element zum Löschen ausgewählt!");
			}
			this.step4validation();
		},
		step1validation: function () {
			var sInputTxtSh = this.byId("inputTxtSh").getValue(),
				sInputTxtMd = this.byId("inputTxtMd").getValue(),
				sInputTxtLg = this.byId("inputTxtLg").getValue(),
				sInputDatamart = this.byId("inputDatamart").getValue(),
				oInputTxtSh = this.byId("inputTxtSh"),
				oInputTxtMd = this.byId("inputTxtMd"),
				oInputTxtLg = this.byId("inputTxtLg"),
				oInputDatamart = this.byId("inputDatamart"),
				iItems = this.byId("table1").getItems();

			// validation single inputs	
			if (isNaN(sInputDatamart) && sInputDatamart.length == 2) {
				oInputDatamart.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputDatamart.setValueState(sap.ui.core.ValueState.Error);
			}
			if ((isNaN(sInputTxtSh) && sInputTxtSh.length < 21)) {
				oInputTxtSh.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputTxtSh.setValueState(sap.ui.core.ValueState.Error);
			}
			if (isNaN(sInputTxtMd) && sInputTxtMd.length < 41) {
				oInputTxtMd.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputTxtMd.setValueState(sap.ui.core.ValueState.Error);
			}
			if (isNaN(sInputTxtLg) && sInputTxtLg.length < 61) {
				oInputTxtLg.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputTxtLg.setValueState(sap.ui.core.ValueState.Error);
			}

			// Default None state
			if (sInputTxtSh == '') {
				oInputTxtSh.setValueState(sap.ui.core.ValueState.None);
			}
			if (sInputTxtLg == '') {
				oInputTxtLg.setValueState(sap.ui.core.ValueState.None);
			}

			// validation all inputs & next button
			if (iItems.length > 1 && oInputDatamart.getValueState() == sap.ui.core.ValueState.None &&
				oInputTxtSh.getValueState() == sap.ui.core.ValueState.None &&
				oInputTxtMd.getValueState() == sap.ui.core.ValueState.None &&
				oInputTxtLg.getValueState() == sap.ui.core.ValueState.None) {
				this._oWizard.validateStep(this.byId("step1"));
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step1"));
				this._oWizard.setShowNextButton(false);
			}
		},
		step2validation: function () {
			var oInputInfoTyp = this.byId("inputInfoTyp"),
				iInputInfoTyp = oInputInfoTyp.getValue(),
				iItems = this.byId("table2").getItems();

			// validation single input		
			if (iInputInfoTyp.length > 0 && iInputInfoTyp.length == 2)
				oInputInfoTyp.setValueState(sap.ui.core.ValueState.None);
			else
				oInputInfoTyp.setValueState(sap.ui.core.ValueState.Error);

			// Default None state
			if (iInputInfoTyp == '') {
				oInputInfoTyp.setValueState(sap.ui.core.ValueState.None);
			}

			// validation inputs & next button		
			if (iItems.length > 1) {
				this._oWizard.validateStep(this.byId("step2"));
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step2"));
				this._oWizard.setShowNextButton(false);
			}
			this.step1validation();
		},
		step3validation: function () {
			var iInputFunktion = this.byId("inputFuntkion").getValue(),
				sInputEntit = this.byId("inputentit").getValue(),
				sInputWert = this.byId("inputwert").getValue(),
				oInputFunktion = this.byId("inputFuntkion"),
				oInputEntit = this.byId("inputentit"),
				oInputWert = this.byId("inputwert"),
				iItems = this.byId("table3").getItems();

			// validation single inputs	
			if (iInputFunktion.length > 0 && iInputFunktion.length == 2) {
				oInputFunktion.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputFunktion.setValueState(sap.ui.core.ValueState.Error);
			}
			if (isNaN(sInputEntit) && sInputEntit.length > 0 && sInputEntit.length < 61) {
				oInputEntit.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputEntit.setValueState(sap.ui.core.ValueState.Error);
			}
			if (isNaN(sInputWert) && sInputWert.length > 0 && sInputWert.length < 61) {
				oInputWert.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputWert.setValueState(sap.ui.core.ValueState.Error);
			}

			// Default None state
			if (iInputFunktion == '') {
				oInputFunktion.setValueState(sap.ui.core.ValueState.None);
			}
			if (sInputEntit == '') {
				oInputEntit.setValueState(sap.ui.core.ValueState.None);
			}
			if (sInputWert == '') {
				oInputWert.setValueState(sap.ui.core.ValueState.None);
			}

			// validation all inputs & next button
			if (iItems.length > 1) {
				this._oWizard.validateStep(this.byId("step3"));
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step3"));
				this._oWizard.setShowNextButton(false);
			}
			this.step2validation();
		},
		step4validation: function () {
			var iItems = this.byId("table4").getItems();

			// validation all inputs & next button
			if (iItems.length > 1) {
				this._oWizard.validateStep(this.byId("step4"));
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step4"));
				this._oWizard.setShowNextButton(false);
			}
			this.step3validation();
		},
		handleWizardSubmit: function () {
			var fnSucces = function () {
				sap.m.MessageToast.show("Object created successfully");
			},
				fnError = function (oError) {
					sap.m.MessageBox.error(oError.message);
				};

			this._oModel.submitBatch("$direct").then(fnSucces, fnError);
			sap.m.MessageToast.show("Action completed successfully");
			this.getRouter().navTo("Home");
		},
		discardProgress1: function () {
			this._oWizard.discardProgress(this.byId("step1"));

			var clearContent = function (aContent) {
				for (var i = 0; i < aContent.length; i++) {
					if (aContent[i].setValue) {
						aContent[i].setValue("");
					}
					if (aContent[i].getContent) {
						clearContent(aContent[i].getContent());
					}
				}
			};
			clearContent(this._oWizard.getSteps());
		}
	});
});
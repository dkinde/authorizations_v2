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
			this.sDatamart = "";
			this.aDatamart = [];
			this.aFiltersCube = [];
			this.setStep1 = [];
			this.setStep1Texts = [];
			this.setStep2 = [];
			this.setStep3 = [];
			this.setStep4 = [];
			this.setFunction = [];
			this.aValores = [];
			this.aProvider = [];
			this.aEntit = [];
			this.maxTyp = 1;

			var that = this,
				iSkip = 0,
				iSkip1 = 0;

			for (let i = 1; i <= 4; i++) {
				this.getView().byId("table" + i).addStyleClass("firstRow");
			}

			function getData() {
				$.ajax({
					url: that.getOwnerComponent().getModel().sServiceUrl + "/MP_CUBE_IOBJ" + "?$top=100" + "&$skip=" + iSkip,
					method: "GET",
					success: function (data) {
						if (data && data.value) {
							that.aValores = that.aValores.concat(data.value.map(function (item) {
								return item;
							}));
						}
						if (data.value.length === 100) {
							iSkip += 100;
							getData();
						} else {
							return;
						}
					}.bind(this),
					error: function (errorEntit1) {
						console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
					}
				});
			}
			getData();

			function getProvider() {
				$.ajax({
					url: that.getOwnerComponent().getModel().sServiceUrl + "/HAUPARZL" + "?$top=100" + "&$skip=" + iSkip1,
					method: "GET",
					success: function (data) {
						if (data && data.value) {
							that.aProvider = that.aProvider.concat(data.value.map(function (item) {
								return item;
							}));
						}
						if (data.value.length === 100) {
							iSkip1 += 100;
							getProvider();
						} else {
							return;
						}
					}.bind(this),
					error: function (errorEntit1) {
						console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
					}
				});
			}
			getProvider();

			function getEntit() {
				$.ajax({
					url: that.getOwnerComponent().getModel().sServiceUrl + "/ENTITAT",
					method: "GET",
					success: function (data) {
						if (data && data.value) {
							that.aEntit = that.aEntit.concat(data.value.map(function (item) {
								return item;
							}));
						}
					}.bind(this),
					error: function (errorEntit1) {
						console.log("Fehler bei der Abfrage von Entität 1:", errorEntit1);
					}
				});
			}
			getEntit();

			this.getMaxTyp();
			this.byId("step1").setVisible(true);

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
				aItems4 = oTable4.getItems(),
				oTable5 = this.getView().byId("table5"),
				aItems5 = oTable5.getItems();

			/* this.aValores = [];
			this.aProvider = [];
			this.aEntit = []; */

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
			for (var i = 0; i < aItems5.length; i++) {
				oTable5.removeItem(aItems5[i]);
			}

			// clean step 1
			this.byId("inputDatamart").setEditable(true);
			this.byId("inputTxtSh").setEditable(true);
			this.byId("inputTxtLg").setEditable(true);
			this.byId("inputTxtSh").setValue("");
			this.byId("inputTxtLg").setValue("");
			this.byId("datamartText").setText("");
			this.byId("inputDatamart").setValue("");
			this.byId("selectMulti").setSelectedKey(null);

			// clean step 2
			this.byId("selectInfoAuthName").setSelectedKey(null);
			this.byId("selectCube").setSelectedKey(null);
			this.byId("selectIobj").setSelectedKey(null);
			this.byId("inputInfoTyp").setValue("");
			this.byId("selectSequenz").setSelectedKey(null);

			// clean step 3
			this.byId("inputFuntkion").setValue("");
			this.byId("selecttyp").setSelectedKey(null);
			this.byId("selectentit").setSelectedKey(null);
			this.byId("inputwert").setValue("");

			// clean step 4
			this.byId("selectpersonalnummer").setSelectedKey(null);
			this.byId("selectfunktion").setSelectedKey(null);

			this.setStep1 = [];
			this.setStep1Texts = [];
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
			var sInputDatamart = this.byId("inputDatamart").getValue().toUpperCase();
			this.byId("inputDatamart").setValue(sInputDatamart);
			if (sInputDatamart.length == 2)
				this.byId("datamartText").setText(sInputDatamart);
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

		filterIobj: function () {
			var sCube = [this.byId("selectCube").getSelectedItem().getText()],
				aItems = this.filterCube(this.aValores, sCube, 2),
				oSelectCube = this.getView().byId("selectIobj");
			oSelectCube.removeAllItems();
			for (var i = 0; i < aItems.length; i++) {
				oSelectCube.addItem(new sap.ui.core.Item({
					key: i.toString(),
					text: aItems[i].Iobjnm
				}));
			}
		},
		filterCube: function (aValue, aFilter, aColumn) {
			var aCube = [],
				uniqueCube = new Set();
			aFilter.forEach(element => {
				aValue.forEach(item => {
					if (aColumn == 1) {
						if (item.Infocube === element && !uniqueCube.has(item.Partcube)) {
							uniqueCube.add(item.Partcube);
							aCube.push(item);
						}
					}
					if (aColumn == 2) {
						if (item.Partcube === element && !uniqueCube.has(item.Iobjnm)) {
							uniqueCube.add(item.Iobjnm);
							aCube.push(item);
						}
					}
				});
			});
			return aCube;
		},
		filterTyp: function () {
			var selTyp = this.byId("selecttyp").getSelectedItem().getText(),
				selEnt = this.byId("selectentit");

			selEnt.removeAllItems();
			this.aEntit.forEach(item => {
				if (item.typ == selTyp) {
					selEnt.addItem(new sap.ui.core.Item({
						text: item.entit
					}));
				}
			});

			if (selTyp == "D") {
				selEnt.setSelectedItem(selEnt.getItems()[0]);
				this.byId("inputwert").setValue(this.sDatamart);
				this.byId("inputwert").setEditable(false);
			} else {
				this.byId("inputwert").setValue("");
				this.byId("inputwert").setEditable(true);
			}
			this.step3validation();
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

		updateTextLg: function () {
			var sInputTxtSh = this.byId("inputTxtSh").getValue(),
				oInputTxtLg = this.byId("inputTxtLg");

			oInputTxtLg.setValue(sInputTxtSh);
			this.step1validation();
		},

		getMaxTyp: function () {
			this.maxTyp = 1;
			var iItems = this.byId("table2").getItems();

			if (iItems.length > 1) {
				for (let i = 1; i < iItems.length; i++) {
					var typ = iItems[i].getCells()[4].getText();
					if (typ >= this.maxTyp)
						this.maxTyp = parseInt(typ, 10) + 1;
				}
			} else {
				this.aProvider.forEach(item => {
					if (item.InfoTyp >= this.maxTyp)
						this.maxTyp = parseInt(item.InfoTyp, 10) + 1;
				});
			}
			this.byId("inputInfoTyp").setValue(this.maxTyp.toString());
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
		updPrev: function (aValue, oItem) {
			var oTable = this.byId("table5");

			aValue.forEach(item => {
				if (item.NameCube === oItem) {
					var oTemplate = new sap.m.ColumnListItem({
						cells: [
							new sap.m.Text({ text: item.InfoAuthName }),
							new sap.m.Text({ text: item.NameCube }),
							new sap.m.Text({ text: item.InfoName }),
							new sap.m.Text({ text: item.Sequenz }),
							new sap.m.Text({ text: item.InfoTyp })
						]
					});
					oTable.addItem(oTemplate);
				}
			});
		},
		onAddPress1: function () {
			try {
				if (this.byId("inputDatamart").getValue() == '' ||
					this.byId("inputTxtSh").getValue() == '' ||
					this.byId("inputTxtLg").getValue() == '')
					throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");

				var oTable = this.byId("table1"),
					existTexts = false,
					oTemplate = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({ text: this.byId("inputDatamart").getValue() }),
						new sap.m.Text({ text: this.byId("selectMulti").getSelectedItem().getText() })]
					});

				if (this.byId("inputDatamart").getValueState() != sap.ui.core.ValueState.None ||
					this.byId("inputTxtSh").getValueState() != sap.ui.core.ValueState.None ||
					this.byId("inputTxtLg").getValueState() != sap.ui.core.ValueState.None)
					throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");

				this.setStep1.forEach(element => {
					if (element[0] == this.byId("inputDatamart").getValue() &&
						element[1] == this.byId("selectMulti").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DuplicatedKey", "Das Element ist vorhanden");
					}
				});
				oTable.addItem(oTemplate);

				this.setStep1.push([this.byId("inputDatamart").getValue(),
				this.byId("selectMulti").getSelectedItem().getText()]);

				if (this.setStep1Texts.length != 0) {
					for (var i = 0; i < this.setStep1Texts.length; i++) {
						if (
							this.byId("inputDatamart").getValue() === this.setStep1Texts[i][0] &&
							this.byId("inputTxtSh").getValue() === this.setStep1Texts[i][1] &&
							this.byId("inputTxtLg").getValue() === this.setStep1Texts[i][2]
						) {
							existTexts = true;
							break;
						}
					}
					if (!existTexts)
						this.setStep1Texts.push([this.byId("inputDatamart").getValue(),
						this.byId("inputTxtSh").getValue(),
						this.byId("inputTxtLg").getValue()]);
				} else {
					this.setStep1Texts.push([this.byId("inputDatamart").getValue(),
					this.byId("inputTxtSh").getValue(),
					this.byId("inputTxtLg").getValue()]);
				}

				console.log(this.setStep1Texts);

				this.aDatamart.push(this.byId("selectMulti").getSelectedItem().getText());
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");
				this.byId("selectMulti").setSelectedKey(null);

				var aItems = this.filterCube(this.aValores, this.aDatamart, 1),
					oSelectCube = this.getView().byId("selectCube");
				oSelectCube.removeAllItems();
				this.byId("table5").removeAllItems();
				for (var i = 0; i < aItems.length; i++) {
					oSelectCube.addItem(new sap.ui.core.Item({
						key: i.toString(),
						text: aItems[i].Partcube
					}));
					this.updPrev(this.aProvider, aItems[i].Partcube);
				}

				// clean step3 selection
				this.byId("inputFuntkion").setValue("");
				this.byId("selecttyp").setSelectedKey(null);
				this.byId("selectentit").setSelectedKey(null);
				this.byId("inputwert").setValue("");

				this.getMaxTyp();
				this.sDatamart = this.byId("inputDatamart").getValue();

				this.step1validation();
				if (this._oWizard.getCurrentStep() == "application-authorization-display-component---Wizard--step3")
					this.step2validation();

			} catch (error) {
				if (error.message == "EmptyFieldException")
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
				if (error.message == "TextFieldException")
					sap.m.MessageBox.warning("Problem mit Textbeschreibungen");
				if (error.message == "DuplicatedKey")
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
						new sap.m.Text({ text: this.byId("selectSequenz").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.maxTyp.toString() })]
					});
				this.setStep2.forEach(element => {
					if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[2] == this.byId("selectIobj").getSelectedItem().getText() &&
						element[4] == this.byId("inputInfoTyp").getValue() &&
						element[3] == this.byId("selectSequenz").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
					}
					if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[2] == this.byId("selectIobj").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("DuplicatedPKey", "Falsche Definition");
					}
					if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[4] != this.byId("inputInfoTyp").getValue()) {
						throw new sap.ui.base.Exception("AuthTypeError", "Falsche Definition");
					}
					if (element[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						element[1] == this.byId("selectCube").getSelectedItem().getText() &&
						element[3] == this.byId("selectSequenz").getSelectedItem().getText()) {
						throw new sap.ui.base.Exception("SequenseError", "Falsche Definition");
					}
					if (element[4] == this.byId("inputInfoTyp").getValue()) {
						if (element[1] == this.byId("selectCube").getSelectedItem().getText())
							auth_flag = true;
						else {
							for (var item of this.setStep2) {
								if (item[0] == this.byId("selectInfoAuthName").getSelectedItem().getText() &&
									item[1] != this.byId("selectCube").getSelectedItem().getText() &&
									item[2] == this.byId("selectIobj").getSelectedItem().getText() &&
									item[4] == this.byId("inputInfoTyp").getValue() &&
									item[3] == this.byId("selectSequenz").getSelectedItem().getText()) {
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
				this.aProvider.forEach(item => {
					if (item.InfoAuthName === this.byId("selectInfoAuthName").getSelectedItem().getText() &&
						item.NameCube === this.byId("selectCube").getSelectedItem().getText())
						throw new sap.ui.base.Exception("AuthException", "Falsche Definition");
				});

				oTable.addItem(oTemplate);
				this.setStep2.push([this.byId("selectInfoAuthName").getSelectedItem().getText(),
				this.byId("selectCube").getSelectedItem().getText(),
				this.byId("selectIobj").getSelectedItem().getText(),
				this.byId("inputInfoTyp").getValue(),
				this.byId("selectSequenz").getSelectedItem().getText()]);
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");
				this.getMaxTyp();
				this.byId("selectInfoAuthName").setSelectedKey(null);
				this.byId("selectCube").setSelectedKey(null);
				this.byId("selectIobj").setSelectedKey(null);
				//this.byId("inputInfoTyp").setValue(this.maxTyp.toString());
				this.byId("selectSequenz").setSelectedKey(null);
				this.step2validation();
			} catch (error) {
				if (error.message == "DuplicatedKey")
					sap.m.MessageBox.warning("Das Element ist vorhanden");
				if (error.message == "AuthException")
					sap.m.MessageBox.warning("Für diese IOBJ existiert bereits eine Berechtigung in diesem Cube");
				if (error.message == "DuplicatedPKey")
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
					funktionValue = this.byId("inputFuntkion").getValue(),
					oTemplate = new sap.m.ColumnListItem({
						cells: [new sap.m.Text({ text: funktionValue }),
						new sap.m.Text({ text: this.byId("selecttyp").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("selectentit").getSelectedItem().getText() }),
						new sap.m.Text({ text: this.byId("inputwert").getValue() })]
					});

				if (this.byId("inputFuntkion").getValue() == "" || this.byId("selecttyp").getSelectedKey() == null ||
					this.byId("selectentit").getSelectedKey() == null || this.byId("inputwert").getValue() == "")
					throw new sap.ui.base.Exception("EmptyFieldException", "Falsche Definition");

				if (funktionValue.length > 2)
					throw new sap.ui.base.Exception("FunktionLengthException", "Falsche Definition");

				this.setStep3.forEach(element => {
					if (element[0] == this.byId("inputFuntkion").getValue() &&
						element[1] == this.byId("selecttyp").getSelectedItem().getText() &&
						element[2] == this.byId("selectentit").getSelectedItem().getText() &&
						element[3] == this.byId("inputwert").getValue()) {
						throw new sap.ui.base.Exception("DuplicatedKey", "Falsche Definition");
					}
					if (this.byId("selecttyp").getSelectedItem().getText() != "D") {
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

				this.step2validation();
				console.log(this.byId("step2").getValidated());

				if (!this.byId("step2").getValidated())
					throw new sap.ui.base.Exception("NoElementsPreviousStep", "Falsche Definition");

				oTable.addItem(oTemplate);

				this.setStep3.push([this.byId("inputFuntkion").getValue(),
				this.byId("selecttyp").getSelectedItem().getText(),
				this.byId("selectentit").getSelectedItem().getText(),
				this.byId("inputwert").getValue()]);

				this.selectFunktion(this.byId("inputFuntkion").getValue());
				sap.m.MessageToast.show("Element erfolgreich hinzugefügt");

				this.step3validation();
				this.byId("inputFuntkion").setValue("");
				this.byId("selecttyp").setSelectedKey(null);
				this.byId("selectentit").setSelectedKey(null);
				this.byId("inputwert").setValue("");

			} catch (error) {
				if (error.message == "NoElementsPreviousStep")
					sap.m.MessageBox.warning("Es fehlen noch Elemente, die in den vorherigen Schritten hinzugefügt werden müssen");
				if (error.message == "FunktionLengthException")
					sap.m.MessageBox.warning("Die Funktion darf nicht mehr als zwei Ziffern lang sein");
				if (error.message == "EmptyFieldException")
					sap.m.MessageBox.warning("Kein Element kann hinzugefügt werden, leere Felder sind vorhanden");
				if (error.message == "DuplicatedKey")
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
						throw new sap.ui.base.Exception("DuplicatedKey", "Das Element ist vorhanden");
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
				if (error.message == "DuplicatedKey") {
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

					var aItems = this.filterCube(this.aValores, this.aDatamart, 1),
						oSelectCube = this.getView().byId("selectCube");
					oSelectCube.removeAllItems();
					this.byId("table5").removeAllItems();
					for (var i = 0; i < aItems.length; i++) {
						oSelectCube.addItem(new sap.ui.core.Item({
							key: i.toString(),
							text: aItems[i].Partcube
						}));
						this.updPrev(this.aProvider, aItems[i].Partcube);
					}
					oSelectedItem.destroy();
					sap.m.MessageToast.show("Element erfolgreich gelöscht");

					this.byId("inputFuntkion").setValue("");
					this.byId("selecttyp").setSelectedKey(null);
					this.byId("selectentit").setSelectedKey(null);
					this.byId("inputwert").setValue("");

					if (this.setStep3 != '' && this.setStep1.length == 0) {
						//TODO: clean  Wert(step3) if Typ Entit is "D" and Entit is "DATAMART"
						var aItems = this.byId("table3").getItems();
						for (var i = 1; i < aItems.length; i++) {
							this.byId("table3").removeItem(aItems[i]);
						}
						this.setStep3 = [];
						this.sDatamart = "";
						this.step3validation();
						if (this.setStep4 != '') {
							var aItems = this.byId("table4").getItems();
							for (var i = 1; i < aItems.length; i++) {
								this.byId("table4").removeItem(aItems[i]);
							}
							this.setStep4 = [];
							this.setFunction = [];
						}
					}

					if (this.setStep1.length == 0) {
						this.setStep1Texts = [];
					}
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
					this.getMaxTyp();
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

			if (oSelectedItem) {
				if (iIndex == 0) {
					sap.m.MessageBox.warning("Dieses Element kann nicht gelöscht werden");
				}
				else {
					iIndex -= 1;
					var iFunktion = this.setStep3[iIndex][0];
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

					//TODO: eliminate in the step 4 if exists an element with the same function

					if (this.setStep4 != '') {
						this.setStep4.forEach((item, index) => {
							if (item[1] == iFunktion) {
								var aItems = this.byId("table4").getItems();
								this.setStep4.splice(index, 1);
								aItems[index + 1].destroy();
							}
						});
					}
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
				sInputTxtLg = this.byId("inputTxtLg").getValue(),
				sInputDatamart = this.byId("inputDatamart").getValue(),
				oInputTxtSh = this.byId("inputTxtSh"),
				oInputTxtLg = this.byId("inputTxtLg"),
				oInputDatamart = this.byId("inputDatamart"),
				iItems = this.byId("table1").getItems();

			function isString(str) {
				return /^[a-zA-Z]+$/.test(str);
			}
			// validation single inputs	
			if (isNaN(sInputDatamart) && sInputDatamart.length == 2 && isString(sInputDatamart)) {
				oInputDatamart.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputDatamart.setValueState(sap.ui.core.ValueState.Error);
			}
			if ((isNaN(sInputTxtSh) && sInputTxtSh.length < 21)) {
				oInputTxtSh.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputTxtSh.setValueState(sap.ui.core.ValueState.Error);
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
			if (sInputDatamart == '') {
				oInputDatamart.setValueState(sap.ui.core.ValueState.None);
			}

			if (this.byId("step2").getVisible())
				this.step2validation();

			// validation all inputs & next button
			if (iItems.length > 1 && oInputDatamart.getValueState() == sap.ui.core.ValueState.None &&
				oInputTxtSh.getValueState() == sap.ui.core.ValueState.None &&
				oInputTxtLg.getValueState() == sap.ui.core.ValueState.None) {
				this.byId("inputDatamart").setEditable(false);
				this.byId("inputTxtSh").setEditable(false);
				this.byId("inputTxtLg").setEditable(false);
				this._oWizard.validateStep(this.byId("step1"));
				this.byId("step2").setVisible(true);
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step1"));
				this._oWizard.setShowNextButton(false);
				this.byId("inputDatamart").setEditable(true);
				this.byId("inputTxtSh").setEditable(true);
				this.byId("inputTxtLg").setEditable(true);
			}

		},
		step2validation: function () {
			var oInputInfoTyp = this.byId("inputInfoTyp"),
				iInputInfoTyp = oInputInfoTyp.getValue(),
				iItems = this.byId("table2").getItems(),
				oItemsCube = this.getView().byId("selectCube").getItems(),
				oTable = this.byId("table5").getItems(),
				flag = true,
				oTableItems = [],
				aText = [];

			// validation single input		
			if (iInputInfoTyp.length > 0 && iInputInfoTyp.length == 2)
				oInputInfoTyp.setValueState(sap.ui.core.ValueState.None);
			else
				oInputInfoTyp.setValueState(sap.ui.core.ValueState.Error);

			// Default None state
			if (iInputInfoTyp == '') {
				oInputInfoTyp.setValueState(sap.ui.core.ValueState.None);
			}

			//all items selectcube
			oItemsCube.forEach(function (oElement) {
				aText.push(oElement.getText());
			});

			//all items table preview - table 5
			if (oTable.length > 0) {
				oTable.forEach(function (oElement) {
					oTableItems.push(oElement.getCells()[1].getText());
				});
			}

			//all new items - table 2
			if (iItems.length > 1) {
				for (let i = 1; i < iItems.length; i++) {
					oTableItems.push(iItems[i].getCells()[1].getText());
				}
			}

			aText.forEach(item => {
				if (!oTableItems.includes(item)) {
					flag = false;
				}
			});

			// validation inputs & next button			
			if (oTableItems.length > 0 && flag) {
				this._oWizard.validateStep(this.byId("step2"));
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step2"));
				this._oWizard.setShowNextButton(false);
			}
		},
		step3validation: function () {
			var iInputFunktion = this.byId("inputFuntkion").getValue(),
				sInputWert = this.byId("inputwert").getValue(),
				oInputFunktion = this.byId("inputFuntkion"),
				oInputWert = this.byId("inputwert"),
				iItems = this.byId("table3").getItems();

			// validation single inputs	
			if (iInputFunktion.length > 0 && iInputFunktion.length < 3) {
				oInputFunktion.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputFunktion.setValueState(sap.ui.core.ValueState.Error);
			}
			if (sInputWert.length > 0 && sInputWert.length < 61) {
				oInputWert.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputWert.setValueState(sap.ui.core.ValueState.Error);
			}

			// Default None state
			if (iInputFunktion == '') {
				oInputFunktion.setValueState(sap.ui.core.ValueState.None);
			}
			if (sInputWert == '') {
				oInputWert.setValueState(sap.ui.core.ValueState.None);
			}

			// validation all inputs & next button
			if (iItems.length > 1 && this.byId("step2").getValidated()) {
				this._oWizard.validateStep(this.byId("step3"));
				this._oWizard.setShowNextButton(true);
			} else {
				this._oWizard.invalidateStep(this.byId("step3"));
				this._oWizard.setShowNextButton(false);
			}
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
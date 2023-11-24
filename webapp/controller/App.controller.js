sap.ui.define(
  [
    "sap/ui/core/mvc/Controller"
  ],
  function (BaseController) {
    "use strict";

    return BaseController.extend("auth.controller.App", {
      onInit: function () {
        this.setLanguage("en");
      },
      setLanguage: function (sLanguage) {
        sap.ui.getCore().getConfiguration().setLanguage(sLanguage);
      }
    });
  }
);

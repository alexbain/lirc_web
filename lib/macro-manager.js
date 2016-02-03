var constants = require('./macro-constants');
var Macro = require('./macro');
var devices = {};
var catchAllDevice = {};
var macroConfigurations = {};
var macros = {};
var manager = {};
var visibleMacroNames = [];
var virtualStates;
var getMacroClosureByName;

function State(name, value) {
  var stateInstance = this;
  this.name = name;
  this.value = value;
  this.providingMacro = null;
  this.toBeCalledOnRisingEdge = [];

  this.setProvidingMacro = function (macro) {
    this.providingMacro = macro;
  };

  this.registerWaitingMacro = function (waitingDoneCallback) {
    this.toBeCalledOnRisingEdge.push(waitingDoneCallback);
  };

  this.notifyWaitingMacros = function () {
    var callback;
    while (this.toBeCalledOnRisingEdge.length > 0) {
      callback = this.toBeCalledOnRisingEdge.shift();
      callback();
    }
  };

  this.ensureIsSet = function (done) {
    if (this.value === constants.STATE_NOT_SET) {
      this.value = constants.STATE_PENDING_SET;
      this.registerWaitingMacro(done);
      this.providingMacro.execute(
        function () {
          stateInstance.notifyWaitingMacros();
        }
      );
    } else if (this.value === constants.STATE_PENDING_SET) {
      this.registerWaitingMacro(done);
    } else {
      done();
    }
  };
}

function StateManager() {
  this.stateByName = {};

  this.registerState = function (name) {
    var state = this.stateByName[name];
    if (! state) {
      state = new State(name, constants.STATE_NOT_SET);
      this.stateByName[name] = state;
    }
    return state;
  };

  this.registerStateProvider = function (stateName, macro) {
    var state = this.registerState(stateName);
    state.setProvidingMacro(macro);
  };

  this.setStateByName = function (name, stateValue) {
    var state = this.stateByName[name];
    state.value = stateValue;
  };

  this.getStateByName = function (name) {
    return this.stateByName[name];
  };

  this.getStateSummary = function () {
    var summary = {};
    var stateName;
    for (stateName in this.stateByName) {
      summary[stateName] = this.stateByName[stateName].value;
    }
    return summary;
  };
}

function registerMacro(macroConfig) {
  var macroName = macroConfig.name;
  var macro = new Macro(macroConfig, manager);
  macroConfigurations[macroName] = macroConfig;
  macros[macroName] = macro;
  if (macro.isVisibleMacro()) {
    visibleMacroNames.push(macroName);
  }
}

function init(newConfiguration) {
  newConfiguration.forEach(function (macro) {
    registerMacro(macro);
  });
}

function resetConfiguration() {
  devices = {};
  catchAllDevice = {};
  macroConfigurations = {};
  macros = {};
  visibleMacroNames = [];
  virtualStates = new StateManager();
}

function registerDevice(device) {
  devices[device.name] = device;
  catchAllDevice = device;
}

getMacroClosureByName = function (done, macroName) {
  var macro = macros[macroName];
  return function () {
    macro.execute(done);
  };
};

function executeMacroByName(macroName) {
  var macro = macros[macroName];
  macro.execute(function () {});
}

function getMacroLabelsForDisplay() {
  return visibleMacroNames;
}

function isMacroDefined(macroName) {
  return !!macros[macroName];
}

function getCurrentStates() {
  return virtualStates.getStateSummary();
}

function registerState(stateName) {
  virtualStates.registerState(stateName);
}

function registerStateProvider(stateName, macro) {
  virtualStates.registerStateProvider(stateName, macro);
}

function requestStateIsSet(callback, stateName) {
  var state = virtualStates.getStateByName(stateName);
  state.ensureIsSet(callback);
}

function setStateByName(stateName, newState) {
  virtualStates.setStateByName(stateName, newState);
}

function getCatchAllDevice() {
  return catchAllDevice;
}

function getDeviceByName(deviceName) {
  return devices[deviceName];
}

manager = {
  registerStateProvider: registerStateProvider,
  registerState: registerState,
  requestStateIsSet: requestStateIsSet,
  setStateByName: setStateByName,
  getCatchAllDevice: getCatchAllDevice,
  getDeviceByName: getDeviceByName,
  isMacroDefined: isMacroDefined,
  getMacroClosureByName: getMacroClosureByName,
};

module.exports = {
  init: init,
  resetConfiguration: resetConfiguration,
  registerDevice: registerDevice,
  execute: executeMacroByName,
  getGuiMacroLabels: getMacroLabelsForDisplay,
  isMacroDefined: isMacroDefined,
  getCurrentStates: getCurrentStates,
};

// vim: expandtab tabstop=8 softtabstop=2 shiftwidth=2

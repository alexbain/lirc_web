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

function Subject() {
  var instance = this;
  this.subscribers = [];
  this.registerSubscriber = function (subscriber) {
    instance.subscribers.push(subscriber);
  };

  this.notifyAll = function () {
    var callback = null;
    while (instance.subscribers.length > 0) {
      callback = instance.subscribers.shift();
      callback();
    }
  };
}

function State(name, value) {
  var stateInstance = this;
  this.name = name;
  this.value = value;
  this.providingMacro = null;
  this.resettingMacro = null;
  this.dependantMacros = [];
  this.toBeCalledOnRisingEdge = new Subject();

  this.setProvidingMacro = function (macro) {
    this.providingMacro = macro;
  };

  this.registerWaitingMacro = function (waitingDoneCallback) {
    this.toBeCalledOnRisingEdge.registerSubscriber(waitingDoneCallback);
  };

  this.notifyWaitingMacros = function () {
    this.toBeCalledOnRisingEdge.notifyAll();
  };

  this.addDependantMacro = function (macro) {
    this.dependantMacros.push(macro);
  };

  this.setResettingMacro = function (macro) {
    this.resettingMacro = macro;
  };

  this.callResettingMacro = function (callback) {
    this.resettingMacro.execute(callback);
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

  this.getDependantStateNames = function () {
    var i;
    var dependantMacro;
    var stateNames = [];
    var dependantStateName;
    for (i = 0; i < this.dependantMacros.length; i++) {
      dependantMacro = this.dependantMacros[i];
      dependantStateName = dependantMacro.getProvidedStateName();
      if (dependantStateName) {
        stateNames.push(dependantStateName);
      }
    }
    return stateNames;
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

  this.registerStateRequester = function (stateName, macro) {
    var state = this.registerState(stateName);
    state.addDependantMacro(macro);
  };

  this.registerStateResetter = function (stateName, macro) {
    var state = this.registerState(stateName);
    state.setResettingMacro(macro);
  };

  this.setStateByName = function (stateName, stateValue) {
    var state = this.getStateByName(stateName);
    if (constants.isStateDefined(stateValue)) {
      state.value = stateValue;
    } else {
      throw new Error('State is not defined: ' + stateValue);
    }
  };

  this.getStateByName = function (stateName) {
    var state = this.stateByName[stateName];
    if (!state) {
      throw new Error('Unknown state name: ' + stateName);
    }
    return state;
  };

  this.getStateSummary = function () {
    var summary = {};
    var stateName;
    for (stateName in this.stateByName) {
      if (this.stateByName.hasOwnProperty(stateName)) {
        summary[stateName] = this.stateByName[stateName].value;
      }
    }
    return summary;
  };

  this.initStates = function (summary) {
    var stateValue;
    var stateName;
    for (stateName in summary) {
      if (summary.hasOwnProperty(stateName)) {
        stateValue = summary[stateName];
        this.setStateByName(stateName, stateValue);
      }
    }
  };
}
virtualStates = new StateManager();

function registerMacro(macroConfig) {
  var macroName = macroConfig.name;
  var macro = new Macro(macroConfig, manager);
  macroConfigurations[macroName] = macroConfig;
  macros[macroName] = macro;
  if (macro.isVisibleMacro()) {
    visibleMacroNames.push(macroName);
  }
}

function init(newConfiguration, initialStates) {
  newConfiguration.forEach(function (macro) {
    registerMacro(macro);
  });
  if (initialStates) {
    virtualStates.initStates(initialStates);
  }
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

function registerStateResetter(stateName, macro) {
  virtualStates.registerStateResetter(stateName, macro);
}

function registerStateProvider(stateName, macro) {
  virtualStates.registerStateProvider(stateName, macro);
}

function registerStateRequester(stateName, macro) {
  virtualStates.registerStateRequester(stateName, macro);
}

function requestStateIsSet(callback, stateName) {
  var state = virtualStates.getStateByName(stateName);
  state.ensureIsSet(callback);
}

function resetStatesByName(stateNames, callback) {
  var callbacksToCollect = stateNames.length;
  var collector = function () {
    if (--callbacksToCollect === 0) {
      callback();
    }
  };

  var i;
  var state;
  for (i = 0; i < stateNames.length; i++) {
    state = virtualStates.getStateByName(stateNames[i]);
    state.callResettingMacro(collector);
  }
}

function requestClearStateIsSave(callback, stateName) {
  var stateToClearReset = virtualStates.getStateByName(stateName);
  var stateNames = stateToClearReset.getDependantStateNames();
  if (stateNames.length > 0) {
    resetStatesByName(stateNames, callback);
  } else {
    callback();
  }
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
  registerStateRequester: registerStateRequester,
  registerStateResetter: registerStateResetter,
  requestStateIsSet: requestStateIsSet,
  requestClearStateIsSave: requestClearStateIsSave,
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

var constants = require('./macro-constants');

function Macro(config, macroManager) {
  var macroIdentity = this;
  this.callersCallback = null;
  this.config = config;
  this.name = config.name;
  this.macroClosureChain = null;

  function createMacroStep(done, stepDescription) {
    var deviceName = stepDescription[0];
    var device = macroManager.getDeviceByName(deviceName);
    var failMessage = null;

    if (device) {
      failMessage = device.validateArguments(stepDescription);
      if (failMessage) {
        throw new Error('Can not create macro. Device "' + deviceName + '" rejected '
          + JSON.stringify(stepDescription) + '. Reason: ' + failMessage);
      }
    } else {
      device = macroManager.getCatchAllDevice();
      failMessage = device.validateArguments(stepDescription);
      if (failMessage) {
        throw new Error('Can not create macro. DeviceName "' + deviceName + '" is not known in '
        + JSON.stringify(stepDescription) + '. Reason: fallback device is ' + device.name
        + ' and it can not interpret this line: ' + failMessage);
      }
    }

    return function () {
      device.call(done, stepDescription);
    };
  }

  function createDelayMacroStep(done, delayValue) {
    return function () {
      setTimeout(done, delayValue);
    };
  }

  function insertMacroStep(done, stepConfiguration) {
    var deviceName = stepConfiguration[0];

    if (deviceName.toLowerCase() === 'call') {
      return macroManager.getMacroClosureByName(done, stepConfiguration[1]);
    } else if (deviceName.toLowerCase() === 'delay') {
      return createDelayMacroStep(done, stepConfiguration[1]);
    }

    return createMacroStep(done, stepConfiguration);
  }

  function stepNeedsDefaultDelay(sequence, index) {
    var stepConfiguration;
    var deviceName;

    if (index < 0) {
      return false;
    }

    stepConfiguration = sequence[index];
    deviceName = stepConfiguration[0];
    return deviceName.toLowerCase() !== 'delay';
  }

  function insertMacroFromSequence(callWhenDone, sequence, defaultDelay) {
    var i;
    var done = callWhenDone;

    for (i = sequence.length - 1; i >= 0; i--) {
      done = insertMacroStep(done, sequence[i].slice());
      if (stepNeedsDefaultDelay(sequence, i - 1)) {
        done = createDelayMacroStep(done, defaultDelay);
      }
    }

    return done;
  }

  this.createClosureChain = function () {
    var defaultDelay = config.defaultDelay ?
      config.defaultDelay : constants.DEFAULT_DELAY;
    var sequence = config.sequence;
    return insertMacroFromSequence(this.notifyListeners, sequence, defaultDelay);
  };

  this.isProvidingState = function () {
    return config.provides
    && config.provides !== null
    && config.provides !== '';
  };

  this.isRequiringState = function () {
    return config.requires
    && config.requires !== null
    && config.requires !== '';
  };

  this.isResettingState = function () {
    return config.resets
    && config.resets !== null
    && config.resets !== '';
  };

  this.notifyListeners = function () {
    var callback;

    if (macroIdentity.isProvidingState()) {
      macroManager.setStateByName([config.provides], constants.STATE_SET);
    }
    if (macroIdentity.isResettingState()) {
      macroManager.setStateByName([config.resets], constants.STATE_NOT_SET);
    }
    if (macroIdentity.callersCallback !== null) {
      callback = macroIdentity.callersCallback;
      macroIdentity.callersCallback = null;
      callback();
    }
  };

  this.isVisibleMacro = function () {
    return !(config.hidden && config.hidden === true);
  };

  this.registerStates = function () {
    if (this.isProvidingState()) {
      macroManager.registerStateProvider(config.provides, this);
    }
    if (this.isRequiringState()) {
      macroManager.registerStateRequester(config.requires, this);
    }
    if (this.isResettingState()) {
      macroManager.registerStateResetter(config.resets, this);
    }
  };

  this.execute = function (done) {
    this.callersCallback = done;
    if (this.isRequiringState()) {
      macroManager.requestStateIsSet(this.macroClosureChain, config.requires);
    } else if (this.isResettingState()) {
      macroManager.requestClearStateIsSave(this.macroClosureChain, config.resets);
    } else {
      this.macroClosureChain();
    }
  };

  this.getProvidedStateName = function () {
    return config.provides;
  };

  this.macroClosureChain = this.createClosureChain();
  this.registerStates();
}

module.exports = Macro;

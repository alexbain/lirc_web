var DEVICE_NAME = 'gpio';
// var wpi = require('wiring-pi');
var wpi = require('../test/lib/wiring-pi-mock.js');
var gpios = null;

function updatePinStates() {
  var i;
  var gpio;
  if (gpios) {
    for (i = 0; i < gpios.length; i++) {
      gpio = gpios[i];
      gpio.state = wpi.digitalRead(gpio.pin);
    }
  }
}

function togglePin(pinId) {
  var numericPinId = parseInt(pinId, 10);
  var currentState = wpi.digitalRead(numericPinId);
  var newState = currentState > 0 ? 0 : 1;
  wpi.digitalWrite(numericPinId, newState);
  return {
    pin: numericPinId,
    state: newState,
  };
}

function findElement(array, propertyName, propertyValue) {
  var i;
  for (i = 0; i < array.length; i++) {
    if (array[i][propertyName] === propertyValue) {
      return array[i];
    }
  }
}

function getPinIdByName(pinName) {
  var gpioPin = findElement(gpios, 'name', pinName);
  return gpioPin.pin;
}

function setPin(pinName, newState) {
  var numericPinId = getPinIdByName(pinName);
  wpi.digitalWrite(numericPinId, newState);
}

function init(configuration) {
  if (configuration) {
    gpios = configuration;
    wpi.setup('gpio');
    updatePinStates();
  }
}

function overrideWiringPi(wpiReplacement) {
  var origWpi = wpi;
  wpi = wpiReplacement;
  return origWpi;
}

function call(done, command) {
  setPin(command[1], command[2]);
  done();
}

function validateArguments(args) {
  var deviceName = args[0];
  var pinName = args[1];
  var state = args[2];
  var returnString = null;

  if (deviceName !== DEVICE_NAME) {
    returnString = '\'gpio\' is required as first argument';
  } else if (! findElement(gpios, 'name', pinName)) {
    returnString = 'No GPIO Pin configured with name ' + pinName;
  } else if (state !== 0 && state !== 1) {
    returnString = 'Illegal state ' + state;
  } else if (args.length > 3) {
    returnString = 'Extra argument';
  }
  return returnString === null ? null : returnString + ' in macro step ' + JSON.stringify(args);
}


module.exports = {
  name: DEVICE_NAME,
  init: init,
  setPin: setPin,
  overrideWiringPi: overrideWiringPi,
  updatePinStates: updatePinStates,
  togglePin: togglePin,
  validateArguments: validateArguments,
  call: call,
};
// vim: expandtab:tabstop=8:softtabstop=2:shiftwidth=2

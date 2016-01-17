var wpi = require('wiring-pi');
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

module.exports = {
  init: init,
  setPin: setPin,
  overrideWiringPi: overrideWiringPi,
  updatePinStates: updatePinStates,
  togglePin: togglePin,
};
// vim: expandtab:tabstop=8:softtabstop=2:shiftwidth=2

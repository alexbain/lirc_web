var gpioLib = require('gpio');

function configurePin(callback, pinConfig) {
  gpioLib.export(pinConfig.pin, {
    direction: 'out',
  });
}

exports.init = function (callback, config) {
  var configsLeft = config.length();
  var i;
  function collector() {
    configsLeft -= 1;
    if (configsLeft === 0) {
      if (callback) callback();
    }
  }
  for (i = 0; i < config.length(); i++) {
    configurePin(collector, config[i]);
  }
};

exports.getPinStateById = function (callback, pinId) {
  var result = pinId; // TODO gpio.readPin(pinId) or so
  if (callback) {
    callback(result);
  }
};

exports.setPinByIdToState = function (callback, pinId, newState) {
  // wpi.digitalWrite(pinId, newState); TODO
  if (callback) {
    callback(newState);
  }
};

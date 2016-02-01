var gpioLib = require('gpio');
var pinStubs = {};

function configurePin(callback, pinConfig) {
  var stub = gpioLib.export(pinConfig.pin, {
    direction: 'out',
    interval: 500,
    ready: callback,
  });
  pinStubs['' + pinConfig.pin] = stub;
}

exports.init = function (callback, config) {
  var configsLeft = config.length;
  var i;
  function collector() {
    configsLeft -= 1;
    if (configsLeft === 0) {
      if (callback) callback();
    }
  }
  for (i = 0; i < config.length; i++) {
    configurePin(collector, config[i]);
  }
};

exports.getPinStateById = function (callback, pinId) {
  var result = pinStubs['' + pinId].value;
  if (callback) {
    callback(result);
  }
};

exports.setPinByIdToState = function (callback, pinId, newState) {
  var stub = pinStubs['' + pinId];
  stub.set(newState, function () {
    if (callback) {
      callback(stub.value);
    }
  });
};

exports.name = 'gpio';

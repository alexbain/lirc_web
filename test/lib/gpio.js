var gpio = require('../../lib/gpio');
var assert = require('assert');
var gpioProbe = require('./wiring-pi-mock.js');

var config = [
  { 'name': 'a', 'pin': 47, 'state': 0 },
  { 'name': 'b', 'pin': 11, 'state': 0 }];

describe('gpio', function () {
  var realWpi;
  before(function () {
    gpioProbe.initPinsWith(0);
    realWpi = gpio.overrideWiringPi(gpioProbe);
    gpio.init(config);
  });

  after(function () {
    gpio.overrideWiringPi(realWpi);
  });

  describe('updatePinStates', function () {
    it('should update all pin states', function () {
      gpioProbe.initPinsWith(1);
      gpio.updatePinStates();
      assert.deepEqual(
        config,
        [{ 'name': 'a', 'pin': 47, 'state': 1 },
         { 'name': 'b', 'pin': 11, 'state': 1 }],
        'states are not updated properly');
    });
  });

  describe('togglePin', function () {
    it('should change active pin to inactive', function () {
      var res;
      gpioProbe.initPinsWith(1);
      res = gpio.togglePin(47);
      assert.deepEqual(
        res,
        { 'pin': 47, 'state': 0 },
        'pin has not changed its state');
    });

    it('should change inactive pin to active', function () {
      var res;
      gpioProbe.initPinsWith(0);
      res = gpio.togglePin(47);
      assert.deepEqual(
        res,
        { 'pin': 47, 'state': 1 },
        'pin has not changed its state');
    });
  });

  describe('setPin', function () {
    it('should set a pin by name to the given value', function () {
      gpioProbe.initPinsWith(0);
      gpio.setPin('a', 1);
      assert.equal(gpioProbe.emulatedPins[47], 1);
      gpio.setPin('a', 1);
      assert.equal(gpioProbe.emulatedPins[47], 1);
      gpio.setPin('a', 0);
      assert.equal(gpioProbe.emulatedPins[47], 0);
    });
  });

  describe('init', function () {
    it('should initialize the wiring_pi library to use gpio address schema', function () {
      assert.equal(gpioProbe.schema, 'gpio');
    });
  });
});

// vim: expandtab:tabstop=8:softtabstop=2:shiftwidth=2

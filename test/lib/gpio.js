var gpio = require('../../lib/gpio');
var assert = require('assert');
var gpioProbe = require('./../../lib/gpio-la-mock.js');

var config = [
  { name: 'a', pin: 47, state: 0 },
  { name: 'b', pin: 11, state: 0 }];

describe('gpio', function () {
  before(function () {
    gpioProbe.initPinsWith(0);
    gpio.setGpioLibrary(gpioProbe);
    gpio.init(config);
  });

  describe('updatePinStates', function () {
    it('should update all pin states', function (done) {
      gpioProbe.initPinsWith(1);
      gpio.updatePinStates(function (result) {
        assert.deepEqual(
          result,
          [{ name: 'a', pin: 47, state: 1 },
            { name: 'b', pin: 11, state: 1 }],
          'states are not updated properly');
        done();
      }, config);
    });
  });

  describe('togglePin', function () {
    it('should change active pin to inactive', function (done) {
      gpioProbe.initPinsWith(1);
      gpio.togglePin(function (res) {
        assert.deepEqual(
          res,
          { pin: 47, state: 0 },
          'pin has not changed its state');
        done();
      }, 47);
    });

    it('should change inactive pin to active', function (done) {
      gpioProbe.initPinsWith(0);
      gpio.togglePin(function (res) {
        assert.deepEqual(
          res,
          { pin: 47, state: 1 },
          'pin has not changed its state');
        done();
      }, 47);
    });
  });

  describe('setPin', function () {
    it('should set a pin by name to the given value', function (done) {
      gpioProbe.initPinsWith(0);
      gpio.setPin(function () {
        assert.equal(gpioProbe.emulatedPins[47], 1);
        gpio.setPin(function () {
          assert.equal(gpioProbe.emulatedPins[47], 1);
          gpio.setPin(function () {
            assert.equal(gpioProbe.emulatedPins[47], 0);
            done();
          }, 'a', 0);
        }, 'a', 1);
      }, 'a', 1);
    });
  });
});

// vim: expandtab:tabstop=8:softtabstop=2:shiftwidth=2

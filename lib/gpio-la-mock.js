module.exports = {
  emulatedPins: new Array(50),
  getPinStateById: function (callback, pin) {
    callback(this.emulatedPins[pin]);
  },
  setPinByIdToState: function (callback, pin, state) {
    this.emulatedPins[pin] = state;
    callback(this.emulatedPins[pin]);
  },
  init: function (callback) {
    this.initPinsWith(0);
    if (callback) {
      callback();
    }
  },
  initPinsWith: function (value) {
    var i;
    for (i = 0; i < this.emulatedPins.length; i++) {
      this.emulatedPins[i] = value;
    }
  },
  name: 'mock',
};

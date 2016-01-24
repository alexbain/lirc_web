module.exports = {
  emulatedPins: new Array(50),
  schema: null,
  digitalRead: function (pin) {
    return this.emulatedPins[pin];
  },
  digitalWrite: function (pin, state) {
    this.emulatedPins[pin] = state;
    return this.emulatedPins[pin];
  },
  setup: function (schema) {
    this.schema = schema;
  },
  initPinsWith: function (value) {
    var i;
    for (i = 0; i < this.emulatedPins.length; i++) {
      this.emulatedPins[i] = value;
    }
  },
};

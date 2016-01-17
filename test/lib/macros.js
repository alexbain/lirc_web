var macros = require('../../lib/macros');
var assert = require('assert');
var sinon = require('sinon');

// config fixture
var config = {
  macros: {
    'Play Xbox 360': [
      ['SonyTV', 'Power'],
      ['SonyTV', 'Xbox360'],
      ['Yamaha', 'Power'],
      ['Yamaha', 'Xbox360'],
      ['Xbox360', 'Power'],
    ],
    'Macro With Delay': [
      ['delay', 500],
      ['Yamaha', 'Power'],
    ],
  },
};

describe('macros', function () {
  var lircNode;
  var clock;
  var stub;

  beforeEach(function (done) {
    clock = sinon.useFakeTimers();

    lircNode = {};
    lircNode.irsend = {};
    lircNode.irsend.send_once = function () {};

    stub = sinon.stub(lircNode.irsend, 'send_once', function (remote, command, cb) {
      cb();
    });

    done();
  });

  afterEach(function (done) {
    clock.restore();

    done();
  });

  describe('exec', function () {
    it('should call lircNode.irsend.send_once when executing a macro', function () {
      macros.exec(config.macros['Play Xbox 360'], lircNode);

      assert.equal(stub.called, true);
    });

    it('should delay when encountering a delay', function () {
      macros.exec(config.macros['Macro With Delay'], lircNode);

      assert.equal(stub.called, false);

      // not enough time has passed, stub should not have been called
      clock.tick(250);
      assert.equal(stub.called, false);

      // enough time has now passed, macro should have tried to execute next command
      clock.tick(250);
      assert.equal(stub.called, true);
    });

    it('should call send_once once per command', function () {
      macros.exec(config.macros['Play Xbox 360'], lircNode);
      // wait enough time
      clock.tick(500);

      assert.equal(stub.callCount, 5);
    });
  });
});

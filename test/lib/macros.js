var macros = require('../../lib/macros');
var assert = require('assert');
var sinon = require('sinon');

// config fixture
var config = require('../fixtures/config.json');

describe('macros', function () {
  var lircNode;
  var clock;
  var sendOnceStub;
  var sendStartStub;
  var sendStopStub;


  beforeEach(function (done) {
    clock = sinon.useFakeTimers();

    lircNode = {};
    lircNode.irsend = {};
    lircNode.irsend.send_once = function () {};
    lircNode.irsend.send_start = function () {};
    lircNode.irsend.send_stop = function () {};


    sendOnceStub = sinon.stub(lircNode.irsend, 'send_once', function (remote, command, cb) {
      cb();
    });

    sendStartStub = sinon.stub(lircNode.irsend, 'send_start', function (remote, command, cb) {
      cb();
    });

    sendStopStub = sinon.stub(lircNode.irsend, 'send_stop', function (remote, command, cb) {
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

      assert.equal(sendOnceStub.called, true);
    });

    it('should delay when encountering a delay', function () {
      macros.exec(config.macros['Macro With Delay'], lircNode);

      assert.equal(sendOnceStub.called, false);

      // not enough time has passed, sendOnceStub should not have been called
      clock.tick(250);
      assert.equal(sendOnceStub.called, false);

      // enough time has now passed, macro should have tried to execute next command
      clock.tick(250);
      assert.equal(sendOnceStub.called, true);
    });

    it('should call send_once once per command', function () {
      macros.exec(config.macros['Play Xbox 360'], lircNode);
      // wait enough time
      clock.tick(500);
      assert.equal(sendOnceStub.callCount, 5);
    });

    it('should call send_start and send_stop at least once', function () {
      macros.exec(config.macros['XboxOne Off'], lircNode);

      assert.equal(sendStartStub.called, true);

      // sendStopStub shouldn't have been called yet
      assert.equal(sendStopStub.called, false);

      // wait
      clock.tick(1600);

      assert.equal(sendStopStub.called, true);

      // Wait some more before checking the last methods were called
      clock.tick(200);
      assert.equal(sendOnceStub.callCount, 2);
    });
  });
});

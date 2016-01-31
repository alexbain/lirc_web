var app = require('../app');
var assert = require('assert');
var request = require('supertest');
var jsdom = require('jsdom');
var fs = require('fs');
var jquery = fs.readFileSync('node_modules/jquery/dist/jquery.js', 'utf-8');
var configFixture = require(__dirname + '/fixtures/config.json');
var gpioMock = require('./../lib/gpio-la-mock');
var gpio = require('../lib/gpio');

describe('lirc_web', function () {
  beforeEach(function () {
    var deviceMock = require('./lib/lirc').getDeviceMock(require('./fixtures/remotes'));
    var lirc = require('../lib/lirc');
    var macros = require('../lib/macro-manager');
    var config = require('./fixtures/config');
    macros.resetConfiguration();
    gpio.init(configFixture.gpios);
    macros.registerDevice(gpio);
    lirc.overrideHardware(deviceMock);
    lirc.init(config);
    macros.registerDevice(lirc);
    macros.init(config.macros);
  });

  describe('routes', function () {
    // Root route
    it('should have an index route "/"', function (done) {
      assert(request(app).get('/').expect(200, done));
    });

    it('should have GET route for a refresh of configuration', function (done) {
      assert(request(app).get('/refresh').expect(302, done));
    });

    // JSON API
    it('should have GET route for JSON list of macros', function (done) {
      assert(request(app).get('/macros.json').expect(200, done));
    });

    it('should have GET route for JSON list of remotes', function (done) {
      assert(request(app).get('/remotes.json').expect(200, done));
    });

    it('should have GET route for JSON list of commands for remote', function (done) {
      assert(request(app).get('/remotes/Xbox360.json').expect(200, done));
    });

    it('should give a 404 for a JSON list of commands for unknown remote', function (done) {
      assert(request(app).get('/remotes/DOES_NOT_EXIST.json').expect(404, done));
    });

    it('should have GET route for JSON list of gpio pins', function (done) {
      assert(request(app).get('/gpios.json').expect(200, done));
    });

    // Sending commands
    it('should have POST route for sending a command', function (done) {
      assert(request(app).post('/remotes/tv/power').expect(200, done));
    });

    it('should have POST route to start repeatedly sending a command', function (done) {
      assert(request(app).post('/remotes/tv/volumeup/send_start').expect(200, done));
    });

    it('should have POST route to stop repeatedly sending a command', function (done) {
      assert(request(app).post('/remotes/tv/volumeup/send_stop').expect(200, done));
    });

    // Sending macros
    it('should have POST route for sending a macro', function (done) {
      assert(request(app).post('/macros/Play%20Xbox%20360').expect(200, done));
    });

    it('should properly handle macros with / in them', function (done) {
      assert(request(app).post('/macros/Listen%20to%20Music%20%2F%20Jams').expect(200, done));
    });

    // Sending GPIO change requests
    it('should have POST route for gpio toggle', function (done) {
      var before = 0;
      gpioMock.initPinsWith(before);
      request(app)
        .post('/gpios/26')
        .set('Accept', 'application/json')
        .expect(200, function (err, result) {
          var pinDescription = JSON.parse(result.text);
          assert(pinDescription.pin, 26, 'response contains requested pin number');
          assert(pinDescription.state, 1, 'response contains requested pin state');
          assert.equal(gpioMock.emulatedPins[26], 1, 'pin state has been changed');
          done();
        });
    });
  });

  describe('index action', function () {
    var error;
    var response;
    var $;

    before(function (done) {
      request(app).get('/').end(function (err, res) {
        error = err;
        response = res;
        jsdom.env({
          html: response.text,
          src: [jquery],
          done: function (errors, window) {
            if (errors) {
              console.log(errors);
            }
            $ = window.$;
            done();
          },
        });
      });
    });

    it('should return an HTML document', function () {
      assert(response.headers['content-type'].match(/html/));
    });

    it('should return an HTML document in which all button elements of class command-link have an '
      + 'href of the form /remotes/:remote/:command', function () {
      assert.equal(error, null);

      $('button.command-link').each(function (idx, elem) {
        var s = $(elem).attr('href').split('/');
        assert.equal(4, s.length);
        assert.equal('', s[0]);
        assert.equal('remotes', s[1]);
      });
    });

    it('should apply remotes configured labels', function () {
      $('ul.remotes-nav').each(function (idx, elem) {
        assert(elem.textContent.match(/LIRC namespace/) !== null);
        assert(elem.textContent.match(/LircNamespace/) === null);
      });
    });

    it('should contain all gpio buttons', function () {
      var gpioButtons = $('button.gpio-link');
      assert.equal(gpioButtons.length, configFixture.gpios.length);
      gpioButtons.each(function (idx, elem) {
        var pin = $(elem).attr('pin');
        assert.equal(pin, configFixture.gpios[idx].pin);
      });
    });
  });

  describe('json api', function () {
    var XBOX_COMMANDS = ['OpenClose', 'FancyButton', 'OnOff', 'Stop',
      'Pause', 'Rewind', 'FastForward', 'Prev', 'Next', 'Play',
      'Display', 'Title', 'DVD_Menu', 'Back', 'Info', 'UpArrow',
      'LeftArrow', 'RightArrow', 'DownArrow', 'OK', 'Y', 'X', 'A', 'B'];

    var LIGHT_COMMANDS = ['S1', 'S3', 'S5'];

    var REFINED_REMOTES = {
      Yamaha: ['Power', 'Xbox360', 'Wii', 'VolumeUp', 'VolumeDown', 'DTV/CBL'],
      SonyTV: ['Power', 'VolumeUp', 'VolumeDown', 'ChannelUp', 'ChannelDown'],
      Xbox360: XBOX_COMMANDS,
      LightControl: LIGHT_COMMANDS,
      LircNamespace:
        ['KEY_POWER', 'KEY_VOLUMEUP', 'KEY_VOLUMEDOWN', 'KEY_CHANNELUP', 'KEY_CHANNELDOWN'],
    };

    it('should return a list of all remotes (and commands) when /remotes.json is accessed',
      function (done) {
        request(app)
        .get('/remotes.json')
        .set('Accept', 'application/json')
        .expect(200, REFINED_REMOTES, done);
      }
    );

    it('should return a list of all commands for a remote when /remotes/:remote.json is '
      + 'accessed', function (done) {
      request(app)
      .get('/remotes/Xbox360.json')
      .set('Accept', 'application/json')
      .expect(200, XBOX_COMMANDS, done);
    });

    it('should return a filtered list of commands when a blacklist exists', function (done) {
      request(app)
      .get('/remotes/LightControl.json')
      .set('Accept', 'application/json')
      .expect(200, LIGHT_COMMANDS, done);
    });

    it('should return a 404 for an unknown remote', function (done) {
      request(app)
      .get('/remotes/DOES_NOT_EXIST.json')
      .end(function (err, res) {
        assert.equal(res.status, 404);
        done();
      });
    });
  });
});
// vim: tabstop=2:shiftwidth=2:sts=2:expandtab

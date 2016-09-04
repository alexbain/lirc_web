var app = require('../app');
var assert = require('assert');
var request = require('supertest');
var jsdom = require('jsdom');
var fs = require('fs');
var jquery = fs.readFileSync('node_modules/jquery/dist/jquery.js', 'utf-8');

describe('lirc_web', function () {
  describe('routes', function () {
    // Root route
    it('should have an index route "/"', function (done) {
      assert(request(app).get('/').expect(200, done));
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

    it('should have GET route for JSON list of commands for macro', function (done) {
      assert(request(app).get('/macros/Play%20Xbox%20360.json').expect(200, done));
    });

    it('should properly handle macros with / in them', function (done) {
      assert(request(app).get('/macros/Listen%20to%20Music%20%2F%20Jams.json').expect(200, done));
    });

    it('should return 404 for unknown remote', function (done) {
      assert(request(app).get('/remotes/DOES_NOT_EXIST.json').expect(404, done));
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

    it('should return an HTML document in which all button elements of class command-link have an href of the form /remotes/:remote/:command', function () {
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
  });

  describe('json api', function () {
    var XBOX_REMOTE = {
      label: 'Xbox360',
      commands: [
        { name: 'OpenClose', label: 'OpenClose' },
        { name: 'FancyButton', label: 'FancyButton' },
        { name: 'OnOff', label: 'OnOff' },
        { name: 'Stop', label: 'Stop' },
        { name: 'Pause', label: 'Pause' },
        { name: 'Rewind', label: 'Rewind' },
        { name: 'FastForward', label: 'FastForward' },
        { name: 'Prev', label: 'Prev' },
        { name: 'Next', label: 'Next' },
        { name: 'Play', label: 'Play' },
        { name: 'Display', label: 'Display' },
        { name: 'Title', label: 'Title' },
        { name: 'DVD_Menu', label: 'DVD_Menu' },
        { name: 'Back', label: 'Back' },
        { name: 'Info', label: 'Info' },
        { name: 'UpArrow', label: 'UpArrow' },
        { name: 'LeftArrow', label: 'LeftArrow' },
        { name: 'RightArrow', label: 'RightArrow' },
        { name: 'DownArrow', label: 'DownArrow' },
        { name: 'OK', label: 'OK' },
        { name: 'Y', label: 'Y' },
        { name: 'X', label: 'X' },
        { name: 'A', label: 'A' },
        { name: 'B', label: 'B' },
      ],
    };

    var LIGHT_REMOTE = {
      label: 'LightControl',
      commands: [
        { name: 'S1', label: 'S1' },
        { name: 'S3', label: 'S3' },
        { name: 'S5', label: 'S5' },
      ],
    };

    var REFINED_REMOTES = {
      Yamaha: {
        label: 'Yamaha',
        commands: [
          { name: 'Power', label: 'Power' },
          { name: 'Xbox360', label: 'Xbox360' },
          { name: 'Wii', label: 'Wii' },
          { name: 'VolumeUp', label: 'VolumeUp' },
          { name: 'VolumeDown', label: 'VolumeDown' },
          { name: 'DTV/CBL', label: 'DTV/CBL' },
        ],
      },
      SonyTV: {
        label: 'SonyTV',
        commands: [
          { name: 'Power', label: 'Power' },
          { name: 'VolumeUp', label: 'VolumeUp' },
          { name: 'VolumeDown', label: 'VolumeDown' },
          { name: 'ChannelUp', label: 'ChannelUp' },
          { name: 'ChannelDown', label: 'ChannelDown' },
        ],
      },
      Xbox360: XBOX_REMOTE,
      LightControl: LIGHT_REMOTE,
      XboxOne: {
        label: 'XboxOne',
        commands: [
          { name: 'Power', label: 'Power' },
          { name: 'Up', label: 'Up' },
          { name: 'Select', label: 'Select' },
        ],
      },
      LircNamespace: {
        label: 'LIRC namespace',
        commands: [
          { name: 'KEY_POWER', label: 'Power' },
          { name: 'KEY_VOLUMEUP', label: 'Vol+' },
          { name: 'KEY_VOLUMEDOWN', label: 'Vol-' },
          { name: 'KEY_CHANNELUP', label: 'Channel Up' },
          { name: 'KEY_CHANNELDOWN', label: 'Channel Down' },
        ],
      },
    };

    it('should return a list of all remotes (and commands) when /remotes.json is accessed', function (done) {
      request(app)
      .get('/remotes.json')
      .set('Accept', 'application/json')
      .expect(200, REFINED_REMOTES, done);
    });

    it('should return a list of all commands for a remote when /remotes/:remote.json is accessed', function (done) {
      request(app)
      .get('/remotes/Xbox360.json')
      .set('Accept', 'application/json')
      .expect(200, XBOX_REMOTE, done);
    });

    it('should return a filtered list of commands when a blacklist exists', function (done) {
      request(app)
      .get('/remotes/LightControl.json')
      .set('Accept', 'application/json')
      .expect(200, LIGHT_REMOTE, done);
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

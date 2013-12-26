var app = require('../app'),
    assert = require('assert'),
    request = require('supertest'),
    sinon = require('sinon');
	jsdom = require("jsdom");


describe('lirc_web', function() {

    describe('routes', function() {

        it('should have an index route accessible via GET', function(done) {
            assert(request(app).get('/').expect(200, done));
        });

        it('should have an API route accessible via POST', function(done) {
            assert(request(app).post('/remotes/tv/power').expect(200, done));
        });

    });

    describe('index action', function() {

        it('should return an HTML document', function(done) {
            assert(request(app).get('/').expect('Content-Type', /html/, done));
        });

		it('should return an HTML document in which all button elements of class command-link have an href of the form /remotes/:remote/:command', function(done) {
			request(app)
				.get('/')
				.end(function(err, res) {
					assert.equal(err, null);
					jsdom.env(res.text, ["http://code.jquery.com/jquery.js"], function (errors, window) {
						var $ = window.$;
						$("button.command-link").each(function(idx, elem) {
						    var s = $(elem).attr('href').split("/");
						    assert.equal(4, s.length);
						    assert.equal("", s[0]);
						    assert.equal("remotes", s[1]);
						});
					    done();
					});
				});
		});
    });

    describe('json api', function() {
		it('should return a list of all remotes (and commands) when /remotes.json is accessed', function(done) {
			request(app)
				.get('/remotes.json')
				.end(function(err, res) {
                    assert.equal(res.status, 200);
                    done();
				});
		});

        it('should return JSON in the format { remotes: [{name: ..., commands: [...]}]} when /remotes.json is accessed', function(done) {
			request(app)
			.get('/remotes.json')
			.end(function(err, res) {
				assert.equal(err, null);
				var json = JSON.parse(res.text);
				var keys = Object.keys(json);
				assert(keys.indexOf('remotes') != -1);
				assert(Array.isArray(json.remotes));
				for (var i in json.remotes) {
					var remote = json.remotes[i];
					keys = Object.keys(remote);
					assert(keys.indexOf('name') != -1);
					assert(!Array.isArray(remote.name));
					assert(typeof remote.name != 'object');
					assert(keys.indexOf('commands') != -1);
					assert(Array.isArray(remote.commands));
					for (var s in remote.commands) {
						var string = remote.commands[s];
						assert(!Array.isArray(string));
						assert(typeof string != 'object');
					}
				}
			    done();
			});
        });

        it('should return a list of all commands for a remote when /remotes/:remote.json is accessed', function(done) {
			request(app)
				.get('/remotes/Microsoft_Xbox360.json')
				.end(function(err, res) {
                    assert.equal(res.status, 200);
                    done();
				});
		});

        it('should return JSON in the format ["string", "string", ...] when /remotes/<remote>.json is accessed', function(done) {
			request(app)
			.get('/remotes/Microsoft_Xbox360.json')
			.end(function(err, res) {
				assert.equal(err, null);
				var commands = JSON.parse(res.text);
				for (var s in commands) {
					var string = commands[s];
					assert(!Array.isArray(string));
					assert(typeof string != 'object');
				}
			    done();
			});
        });

        it('should return a 404 for an unknown remote', function(done) {
            request(app)
				.get('/remotes/DOES_NOT_EXIST.json')
				.end(function(err, res) {
                    assert.equal(res.status, 404);
                    done();
				});
		});
    });

});

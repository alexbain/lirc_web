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

});

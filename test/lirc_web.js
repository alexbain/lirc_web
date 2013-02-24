var app = require('../app'),
    assert = require('assert'),
    request = require('supertest'),
    sinon = require('sinon');

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

    });

});

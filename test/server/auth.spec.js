'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var expect = chai.expect;
var mongoose = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/auth_test'

require(__dirname + '/../../server.js');
var httpBasic = require(__dirname + '/../../lib/http_basic');
var eatAuth = require(__dirname + '/../../lib/eat_auth');

var User = require(__dirname + '/../../models/public_user');

var url = 'localhost:3000/api';

describe('http_basic', function() {
  it("should be able to parse http basic auth", function() {
    var req = {
      headers: {
        authorization: 'Basic ' + (new Buffer('tester:foobar123')).toString('base64')
      }
    };

    httpBasic(req, {}, function() {
      expect(typeof req.auth).to.eql('object');
      expect(req.auth.userName).to.eql('tester');
      expect(req.auth.password).to.eql('foobar123');
    });
  });
});

describe('auth', function() {
  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });

  it("should be able to create a user", function(done) {
    chai.request(url)
      .post('/signup')
      .send({userName: 'tester2', password: 'foobar123'})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body.token).to.have.length.above(0);
        done();
      });
  });

  describe("user already in database", function() {
    before(function(done) {
      var user = new User();
      user.userName = 'tester3';
      user.generateHash('foobar123', function(err, res) {
        if(err) {throw err;}
        user.save(function(err) {
          if(err) {throw err;}
          user.generateToken(function(err, token) {
            if(err) {throw err;}
            this.token = token;
            done();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });

    it("should be able to sign in", function(done) {
      chai.request(url)
        .get('/signin')
        .auth('tester3', 'foobar123')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.token).to.have.length.above(0);
          done();
        });
    });

    it("should be able to authenticate with eatAuth", function(done) {
      var token = this.token;
      var req = {
        headers: {
          token: token
        }
      };

      eatAuth(req, {}, function() {
        expect(req.user.userName).to.eql('tester3');
        done();
      });
    });

    it("should respond accordingly if username already exists", function(done) {
      chai.request(url)
        .post('/signup')
        .send({userName: 'tester3', password: 'fooey123'})
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.status).to.eql(200);
          expect(res.body.msg).to.eql("A user has already signed up with that username.")
          done();
        });
    });
  });
});

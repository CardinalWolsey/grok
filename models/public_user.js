'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var eat = require('eat');

var publicUserSchema = new mongoose.Schema({
  userName: String,
  userId: String,
  password: String,
  signUpDate: Date,
  city: String,
  state: String,
  zip: String,
  phoneNumber: String,
  email: String,
  reviews:[{
    reviewID: String,
    reviewDate: Date,
    businessId: String,
    businessName: String
  }],
  comments: []
});

publicUserSchema.methods.generateHash = function(password, callback) {
  bcrypt.hash(password, 10, function(err, hash) {
    if(err) {
      return callback(err, hash);
    }

    this.password = hash;
    callback(null, hash);
  }.bind(this));
};

publicUserSchema.methods.compareHash = function(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

publicUserSchema.methods.generateToken = function(callback) {
  eat.encode({id: this._id}, process.env.APP_SECRET, callback);
};

module.exports = mongoose.model('PublicUser', publicUserSchema);

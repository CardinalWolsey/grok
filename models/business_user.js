'use strict';

var mongoose = require('mongoose');

var businessUserSchema = new mongoose.Schema({
  userName: String,
  userId: String,
  password: String,
  signUpDate: Date,
  email: String,
  city: String,
  state: String,
  phoneNumber: Number
});

businessUserSchema.methods.generateHash = function(password, callback) {
  bcrypt.hash(password, 10, function(err, hash) {
    if(err) {
      return callback(err, hash);
    }

    this.password = hash;
    callback(null, hash);
  }.bind(this));
};

businessUserSchema.methods.compareHash = function(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

businessUserSchema.methods.generateToken = function(callback) {
  eat.encode({id: this._id}, process.env.APP_SECRET, callback);
};

module.exports = mongoose.model('BusinessUser', businessUserSchema);

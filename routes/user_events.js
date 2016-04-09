var EventEmitter = require('events').EventEmitter;

var handleError = require(__dirname + '/../lib/handle_error');
var User = require(__dirname + '/../models/public_user');

var userEvents = new EventEmitter();

userEvents.on('create_new_user', (req, res) => {
  User.findOne({userName: req.body.userName}, (err, user) => {
    if(user) {
      return res.json({msg: "A user has already signed up with that username."});
    }

    var newUser = new User();
    newUser.userName = req.body.userName;
    newUser.name = req.body.name || '';
    newUser.carSeats = req.body.carSeats;

    userEvents.emit('validated_new_user', req, res, newUser);
  });
});

userEvents.on('validated_new_user', (req, res, user) => {
  user.generateHash(req.body.password, function(err, hash) {
    if(err) {
      return handleError(err, res, 500);
    }

    user.save(function(err, data) {
      if(err) {
        return handleError(err, res, 500);
      }

      userEvents.emit('user_signed_in', req, res, user);
    });
  });
});

userEvents.on('user_signed_in', (req, res, user) => {
  user.generateToken(function(err, token) {
    if(err) {
      return handleError(err, res, 500);
    }

    res.json({token: token});
  });
});

userEvents.on('log_in_user', (req, res) => {
  User.findOne({'userName': req.auth.userName}, (err, user) => {
    if(err) {
      return handleError(err, res, 500);
    }

    if(!user) {
      console.log("Could not authenticate: " + req.auth.userName);
      return handleError(null, res, 401);
    }

    user.compareHash(req.auth.password, (err, hashResponse) => {
      if(err) {
        return handleError(err, res, 500);
      }

      if(!hashResponse) {
        console.log("Could not authenticate: " + req.auth.userName);
        return handleError(null, res, 401);
      }

      userEvents.emit('user_signed_in', req, res, user);
    });
  });
});

module.exports = userEvents;

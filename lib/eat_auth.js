var eat = require('eat');
var PublicUser = require(__dirname + '/../models/public_user');
var handleError = require(__dirname + '/../lib/handle_error');

module.exports = exports = function(req, res, next) {
  var encryptedToken = req.headers.token || (req.body ? req.body.token : undefined);

  if(!encryptedToken) {
    return handleError(null, res, 401);
  }

  eat.decode(encryptedToken, process.env.APP_SECRET, function(err, token) {
    if(err) {
      return handleError(err, res, 500);
    }

    PublicUser.findOne({_id: token.id}, function(err, user) {
      if(err) {
        return handleError(err, res, 500);
      }

      if(!user) {
        return handleError(null, res, 401);
      }

      req.user = user;
      next();
    });
  });
};

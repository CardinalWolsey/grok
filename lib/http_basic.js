var handleError = require(__dirname + '/../lib/handle_error');

module.exports = exports = function(req, res, next) {
  var userPassEncoded = (req.headers.authorization || ' :').split(' ')[1];
  var userPassBuf = new Buffer(userPassEncoded, 'base64');
  var userPassSplit = userPassBuf.toString('utf8').split(':');

  req.auth = {
    userName: userPassSplit[0],
    password: userPassSplit[1]
  };

  if(!(req.auth.userName.length && req.auth.password.length)) {
    console.log('Could not authenticate: ' + req.auth.userName);
    return handleError(null, res, 401);
  }

  next();
};
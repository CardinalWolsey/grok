const express = require('express');
const jsonParser = require('body-parser').json();
const httpBasic = require(__dirname + '/../lib/http_basic');
const BusinessUser = require(__dirname + '/../models/business_user');
const PublicUser = require(__dirname + '/../models/public_user');
const handleError = require(__dirname + '/../lib/handle_error');
const userEvents = require(__dirname + '/user_events');

const userRouter = module.exports = exports = express.Router();

userRouter.post('/signup', jsonParser, (req, res) => {
  userEvents.emit('create_new_user', req, res);
});

userRouter.get('/signin', httpBasic, (req, res) => {
  userEvents.emit('log_in_user', req, res);
});

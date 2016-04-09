// REST API ROUTES FOR BUSINESS REVIEWS
const express = require('express');
const jsonParser = require('body-parser').json();
const Business = require(__dirname + '/../models/business');
const handleError = require(__dirname + '/../lib/handle_error');

const reviewRouter = module.exports = exports = express.Router();

reviewRouter.get('/businesses/:businessid/reviews', (req, res) => {
  Business
    .findById(req.params.businessid)
    .select('name reviews')
    .exec((err, business) => {
      var reviews = business.reviews;
      var response = {
        business: {
          name: business.name,
          id: req.params.businessid
        },
        reviews: reviews
      };
      if (err) return handleError(err, res);
      res.status(200).json(business);
    });
});

reviewRouter.get('/businesses/:businessid/reviews/:reviewid', (req, res) => {
  Business
    .findById(req.params.businessid)
    .select('name reviews')
    .exec((err, business) => {
      var review = business.reviews.id(req.params.reviewid);
      var response = {
        business: {
          name: business.name,
          id: req.params.businessid
        },
        review: review
      };
      if (err) return handleError(err, res);
      res.status(200).json(response);
    });
});

reviewRouter.post('/businesses/:businessid/reviews', jsonParser, (req, res) => {
  Business
    .findById(req.params.businessid)
    .select('reviews')
    .exec((err, business) => {
      var review = {
        author: req.body.author,
        people: req.body.people,
        time: req.body.time,
        quality: req.body.quality,
        soul: req.body.soul,
        missing: req.body.missing
      };
      business.reviews.push(review);
      business.save(function(err, business) {
        var thisReview = business.reviews[business.reviews.length - 1];
        if (err) return handleError(err, res);
        res.status(200).json(thisReview);
      });
    });
});

reviewRouter.put('/businesses/:businessid/reviews/:reviewid', jsonParser, (req, res) => {
  Business
    .findById(req.params.businessid)
    .select('reviews')
    .exec((err, business) => {
      var thisReview = business.reviews.id(req.params.reviewid);
      thisReview.author = req.body.author;
      thisReview.people = req.body.people;
      thisReview.time = req.body.time;
      thisReview.quality = req.body.quality;
      thisReview.soul = req.body.soul;
      thisReview.missing = req.body.missing;

      business.save((err, business) => {
        if (err) return handleError(err, res);
        res.status(200).json('successfully updated review');
      });
    });
});

reviewRouter.delete('/businesses/:businessid/reviews/:reviewid', (req, res) => {
  Business
    .findById(req.params.businessid)
    .select('reviews')
    .exec((err, business) => {
      business.reviews.id(req.params.reviewid).remove();
      business.save(function(err) {
        if (err) return handleError(err, res);
        res.status(200).json('successfully deleted review');
      });
    });
});

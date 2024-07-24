var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require("body-parser");
//const cors = require("cors");
var logger = require('morgan');

//-- Data Base Connection--//
if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config()
}

require("./utils/connectdb");

//---My Routes--//

var indexRouter = require('./routes/index');
const { rateLimiterTimeout, getRepos, fetchRepoContributors } = require('./utils/github-reqs');
const { fetchOrganizationData } = require('./services/github.services');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

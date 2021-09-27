var createError = require('http-errors');
var express = require('express');
var path = require('path');
require('dotenv').config();

var cookieParser = require('cookie-parser');
var logger = require('morgan');
const prerender = require('prerender');
const server = prerender();
const os = require('os');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// server.use(require('prerender-memory-cache'));
// server.use(require('prerender-file-cache'));
server.use(require('./pagesCaching/pagesCaching'));

var app = express();
server.start();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

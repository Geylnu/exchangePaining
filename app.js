var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const winston = require('winston');
const expressWinston = require('express-winston');


var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const secret = '21edc3b9-8328-4bd1-ac8d-289e088a03c6'
var sess = {
  secret,
  rolling: true,
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 31536000000 }, //一年
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.resolve(__dirname, './log/winston/access.log'),
    }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

app.disable("x-powered-by");
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(secret));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sess))

app.use('/api', apiRouter);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.resolve(__dirname, './log/winston/error.log'),
    }),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  dumpExceptions: true,
  showStack: true
}));
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

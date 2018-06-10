var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var form = require('./routes/form');
var engine = require('ejs-locals');

var app = express();
var passport = require('passport');
var flash    = require('connect-flash');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'jade');
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb', extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//var basePath = '/home/hosting_users/mixandmalt/apps/mixandmalt_ipadmenu/public/upload/';
var basePath = path.join(__dirname, 'public/upload/');
var addDocuments = "/";

app.use(addDocuments, express.static(basePath));

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
//app.use(express.logger('dev')); // log every request to the console
//app.use(express.cookieParser()); // read cookies (needed for auth)
//app.use(express.bodyParser()); // get information from html forms

// required for passport
app.use(session({secret: 'secret',resave: true, saveUninitialized: true, cookie: { secure: false }})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes/login.js')(app, passport);
app.use('/', routes);
app.use('/', form);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

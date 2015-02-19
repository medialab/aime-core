/**
 * AIME-core Express Application
 * ==============================
 *
 * Defining the express application aimed at serving the graph database.
 */
var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    compress = require('compression'),
    morgan = require('morgan'),
    cors = require('cors'),
    config = require('../config.json').api,
    responses = require('./responses.js'),
    middlewares = require('./middlewares.js')
    validate = middlewares.validate;

var controllers = require('require-all')(__dirname + '/controllers');

responses(express);

/**
 * Helpers
 */
function loadController(router, routes, auth) {
  routes.forEach(function(route) {
    var args = [route.url];

    if (auth)
      args.push(middlewares.authenticate);

    args.push(middlewares.checkMethod(route.methods || ['GET']));

    if (route.validate)
      args.push(middlewares.validate(route.validate));

    if (route.cache)
      args.push(middlewares.cache(route.cache));

    args.push(route.action);

    router.all.apply(router, args);
  });
}

/**
 * Application definition
 */
var app = express();

// Cross origin
app.use(cors({
  credentials: true,
  origin: function(origin, next) {
    return next(null, !!~config.allowedOrigins.indexOf(origin));
  }
}));

// Log
app.use(morgan('dev'));

// Utilities
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(cookieParser());
app.use(session({
  name: 'aime.sid',
  secret: config.secret,
  trustProxy: false,
  resave: true,
  saveUninitialized: true
}));
// app.use(compress());
app.use(middlewares.language);

/**
 * Login Routes
 */
var loginRouter = express.Router();
loadController(loginRouter, controllers.login);

/**
 * Authenticated Routes
 */
var authenticatedRouter = express.Router();
loadController(authenticatedRouter, controllers.model, true);
loadController(authenticatedRouter, controllers.inquiry, true);

/**
 * Registration
 */
app.use(loginRouter);
app.use(authenticatedRouter);

app.use(function(req, res) {
  return res.notFound();
});

/**
 * Exporting
 */
module.exports = app;

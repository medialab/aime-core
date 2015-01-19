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
    config = require('../config.json').api,
    responses = require('./responses.js'),
    middlewares = require('./middlewares.js')
    validate = middlewares.validate;

var controllers = require('require-all')(__dirname + '/controllers');

responses(express);

/**
 * Helpers
 */
function loadController(router, routes) {
  routes.forEach(function(route) {
    var args = [route.url];

    args.push(middlewares.checkMethod(route.methods || ['GET']));

    if (route.validate)
      args.push(middlewares.validate(route.validate));

    args.push(route.action);

    router.all.apply(router, args);
  });
}

/**
 * Application definition
 */
var app = express();

// Log
app.use(morgan('dev'));

// Utilities
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(cookieParser());
app.use(session({
  secret: config.secret,
  trustProxy: false,
  resave: true,
  saveUninitialized: true
}));
// app.use(compress());

/**
 * Login Routes
 */
var loginRouter = express.Router();
loadController(loginRouter, controllers.login);

/**
 * Authenticated Routes
 */
var authenticatedRouter = express.Router();
authenticatedRouter.use(middlewares.authenticate);
loadController(authenticatedRouter, controllers.model);

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

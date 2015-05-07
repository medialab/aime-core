/**
 * AIME-core Express Application
 * ==============================
 *
 * Defining the express application aimed at serving the graph database.
 */
var express = require('express'),
    env = process.env.NODE_ENV || 'dev',
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    FileStore = require('session-file-store')(session),
    compress = require('compression'),
    morgan = require('morgan'),
    cors = require('cors'),
    config = require('../config.json').api,
    responses = require('./responses.js'),
    middlewares = require('./middlewares.js');

var controllers = require('require-all')(__dirname + '/controllers');

responses(express);

/**
 * Helpers
 */
function loadController(routes, auth) {
  var router = express.Router();

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

  return router;
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

// Session options
var sessionOptions = {
  name: 'aime.sid',
  secret: config.secret,
  trustProxy: false,
  resave: true,
  saveUninitialized: true
};

if (env === 'dev')
  sessionOptions.store = new FileStore({
    path: config.sessionStore,
    ttl: 30 * 24 * 60 * 60
  });

// Utilities
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(cookieParser());
app.use(session(sessionOptions));
// app.use(compress());
app.use(middlewares.language);

/**
 * Routers
 */
var loginRouter = loadController(controllers.login),
    authenticatedRouter = loadController(controllers.model, true),
    crossingsRouter = loadController(controllers.crossings, false);

/**
 * Serving static files
 */
var mediasRouter = express.Router();
mediasRouter.use(middlewares.authenticate);
mediasRouter.use(express.static(config.external));

/**
 * Mounting
 */
app.use(loginRouter);
app.use(authenticatedRouter);
app.use('/crossings', crossingsRouter);
app.use('/medias', mediasRouter);

app.use(function(req, res) {
  return res.notFound();
});

/**
 * Exporting
 */
module.exports = app;

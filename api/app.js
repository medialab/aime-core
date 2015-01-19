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
    middlewares = require('./middlewares.js')
    validate = middlewares.validate;

var controllers = {
  model: require('./controllers/model.js')
};

/**
 * Application definition
 */
var app = express();

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(cookieParser());
app.use(session({
  secret: 'shawarma',
  trustProxy: false,
  resave: true,
  saveUninitialized: true
}));
// app.use(compress());

/**
 * Authenticated Routes
 */
var authenticatedRouter = express.Router();

// TODO: authentification
authenticatedRouter.use(function(req, res, next) {
  next();
});

// Loading routes
controllers.model.forEach(function(route) {
  authenticatedRouter[(route.method || 'GET').toLowerCase()](route.url, route.action);
});

/**
 * Registration
 */
app.use(authenticatedRouter);

/**
 * Exporting
 */
module.exports = app;

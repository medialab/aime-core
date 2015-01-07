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
    morgan = require('morgan'),
    queries = require('./queries.js'),
    middlewares = require('./middlewares.js')
    validate = middlewares.validate;

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

/**
 * Router
 */
var router = express.Router();

// TODO: authentification
router.use(function(req, res, next) {
  next();
});

// Route definitions
var routes = [
  {
    url: '/book',
    action: function(req, res) {
      queries.book('en', function(err, result) {
        if (err) console.log(err);
        return res.type('json').send(JSON.stringify(result, undefined, 2));
      });
    }
  }
];

// Loading routes
routes.forEach(function(route) {
  router[(route.method || 'GET').toLowerCase()](route.url, route.action);
});

/**
 * Registration
 */
app.use(router);

/**
 * Exporting
 */
module.exports = app;

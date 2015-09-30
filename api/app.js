/**
 * AIME-core Express Application
 * ==============================
 *
 * Defining the express application aimed at serving the graph database.
 */
var express = require('express'),
    env = process.env.NODE_ENV || 'dev',
    path = require('path'),
    url = require('url'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    compress = require('compression'),
    morgan = require('morgan'),
    cors = require('cors'),
    config = require('../config.json').api,
    responses = require('./responses.js'),
    middlewares = require('./middlewares.js'),
    cache = require('./cache.js'),
    queries = require('./queries.js').misc,
    db = require('./connection.js'),
    _ = require('lodash');

var controllers = require('require-all')(__dirname + '/controllers');

responses(express);

/**
 * Helpers
 */
function loadController(routes, auth, additionalMiddlewares) {
  var router = express.Router();

  routes.forEach(function(route) {
    var args = [route.url];

    if (auth)
      args.push(auth);

    if (route.validate)
      args.push(middlewares.validate(route.validate));

    if (route.cache)
      args.push(middlewares.cache(route.cache));

    if (additionalMiddlewares)
      additionalMiddlewares.forEach(function(m) {
        args.push(m);
      });

    args.push(route.action);

    (route.methods || ['GET']).forEach(function(method) {
      router[method.toLowerCase()].apply(router, args);
    })
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

// Utilities
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(compress());
app.use(middlewares.language);

/**
 * Routers
 */
var loginRouter = loadController(controllers.login),
    shortenerRouter = loadController(controllers.shortener),
    crossingsRouter = loadController(controllers.crossings, middlewares.authenticate),
    modelRouter = loadController(controllers.model, middlewares.authenticate),
    bookmarkRouter = loadController(controllers.bookmark, middlewares.authenticate),

    // TODO: add stricter clearance to the write model
    writeModelRouter = loadController(
      controllers.model_write,
      middlewares.authenticate,
      [middlewares.cleanCache]
    );

/**
 * Serving static files
 */
var resourcesRouter = express.Router();
resourcesRouter.use(middlewares.authenticate);

// Appending correct headers for PDF files
resourcesRouter.use(function(req, res, next) {
  var parsedUrl = url.parse(req.originalUrl),
      pathname = parsedUrl.pathname;

  if (/\.pdf$/.test(pathname)) {
    res.set('Access-Control-Allow-Headers', 'Range');
    res.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
  }

  return next();
});

resourcesRouter.use(express.static(config.resources));

/**
 * Mounting
 */
app.use(loginRouter);
app.use(modelRouter);
app.use(writeModelRouter);
app.use(bookmarkRouter);
app.use('/short', shortenerRouter);
app.use('/crossings', crossingsRouter);
app.use('/resources', resourcesRouter);

// 404
app.use(function(req, res) {
  return res.notFound();
});

/**
 * Exporting
 */
app.start = function(port, callback) {
  db.query(queries.getMaximumSlugIds, function(err, maxima) {
    if (err) return console.error(err);

    cache.slug_ids = _(['voc', 'doc', 'res', 'ref'])
      .zip(_.map(maxima, 'max'))
      .object()
      .value();

    app.listen(port);
    return callback();
  });
};

module.exports = app;

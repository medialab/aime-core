/* eslint no-console: 0 */
/**
 * AIME-core Express Application
 * ==============================
 *
 * Defining the express application aimed at serving the graph database.
 */
var express = require('express'),
    async = require('async'),
    ENV = process.env.NODE_ENV || 'dev',
    path = require('path'),
    url = require('url'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    createFileStore = require('session-file-store'),
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

var FileStore = createFileStore(session);

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
    });
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
  saveUninitialized: true,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000
  }
};

// If dev, we would like to store sessions for convenience
if (ENV === 'dev')
  sessionOptions.store = new FileStore({
    path: path.join(__dirname, '..', '.sessions'),
    ttl: 24 * 60 * 60 * 60,
    reapInterval: -1
  });


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
    biblibRouter = loadController(controllers.biblib),

    writeModelRouter = loadController(
      controllers.model_write,
      middlewares.admin,
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
app.use('/shortener', shortenerRouter);
app.use('/crossings', crossingsRouter);
app.use('/resources', resourcesRouter);
app.use('/biblib', biblibRouter);

// Stats for the Blog
app.get('/stats', function(req, res) {
  db.rows(queries.stats, function(err, stats) {
    if (err) return res.serverError(err);

    return res.ok({
      contributions: stats.map(function(row) {
        return {
          author: {
            name: row.user.name,
            surname: row.user.surname
          },
          title: row.document.title,
          lang: row.document.lang,
          id: row.document_id
        };
      })
    });
  });
});

// 404
app.use(function(req, res) {
  return res.notFound();
});

/**
 * Exporting
 */
app.start = function(port, callback) {

  // TODO: here
  async.parallel({
    maxima: function(next) {
      db.query(queries.getMaximumSlugIds, function(err, maxima) {
        if (err) return next(err);

        cache.slug_ids = _(['voc', 'doc', 'res', 'ref'])
          .zip(_.map(maxima, 'max'))
          .object()
          .value();

        return next();
      });
    },
    nodes: function(next) {
      db.query(queries.getAllModecross, function(err, rows) {
        if (err) return next(err);

        var nodes = cache.nodes.modecross;

        rows.forEach(function(row) {
          var s = row.name.split('-');

          nodes[row.name] = row.id;

          if (s.length > 1)
            nodes[s[1] + '-' + s[0]] = row.id;
        });

        return next();
      });
    }
  }, function(err) {
    if (err) return console.error(err);

    app.listen(port);
    return callback();
  });
};

module.exports = app;

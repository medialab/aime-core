/**
 * AIME-core Express Responses
 * ============================
 *
 * Defining custom express responses.
 */

module.exports = function(express) {

  express.response.ok = function(result) {
    if (this.cache)
      this.cache = result;

    var data = {
      status: 'ok',
      result: result
    };

    return this.json(data);
  };

  express.response.badRequest = function(reason, expecting) {
    var response = {
      status: 'error',
      error: {
        code: 400,
        title: 'Bad Request',
      }
    };

    if (reason)
      response.error.reason = reason;

    if (expecting)
      response.error.expecting = expecting;

    return this.status(400).json(response);
  };

  express.response.wrongMethod = function(expecting, got) {
    this.status(405).json({
      status: 'error',
      error: {
        code: 405,
        title: 'Method Not Allowed',
        allowed: expecting,
        got: got
      }
    });
  };

  express.response.notFound = function(reason) {
    var response = {
      status: 'error',
      error: {
        code: 404,
        title: 'Not Found'
      }
    };

    if (reason)
      response.error.reason = reason;

    this.status(404).json(response);
  };

  express.response.serverError = function(err) {

    // TEMP: dev logging
    console.log(err);

    this.status(500).json({
      status: 'error',
      error: {
        code: 500,
        title: 'Internal Server Error',
        source: err
      }
    });
  };

  express.response.forbidden = function() {
    this.status(403).json({
      status: 'error',
      error: {
        code: 403,
        title: 'Forbidden'
      }
    });
  };

  express.response.unauthorized = function() {
    this.status(401).json({
      status: 'error',
      error: {
        code: 401,
        title: 'Unauthorized'
      }
    });
  };

  express.response.notImplemented = function() {
    this.status(501).json({
      status: 'error',
      error: {
        code: 501,
        title: 'Not Implemented'
      }
    });
  };
};

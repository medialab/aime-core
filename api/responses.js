/**
 * AIME-core Express Responses
 * ============================
 *
 * Defining custom express responses.
 */

module.exports = function(express) {

  express.response.ok = function(result) {
    return this.json({
      status: 'ok',
      result: result
    });
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

  express.response.notFound = function() {
    this.status(404).json({
      status: 'error',
      error: {
        code: 404,
        title: 'Not Found'
      }
    });
  };
};

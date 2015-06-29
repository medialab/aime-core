/**
 * AIME-core Biblib Model
 * =======================
 *
 * Model responsible for the recuperation of biblib's data.
 */
var jayson = require('jayson'),
    config = require('../../config.json').biblib,
    client = jayson.client.http(config.host);

var model = {

  // Retrieve records by list of ids
  getByIds: function(ids, callback) {
    var stringIds = ids.map(function(ids) {
      return '' + ids;
    });

    client.request(
      'citation_by_rec_ids',
      [config.corpus, stringIds, 'mla', 'html'],
      function(err, response) {
        if (err) return callback(err);

        if (response.error) {
          err = new Error('jsonrpc-fault');
          err.data = response.error;
          return callback(err);
        }

        return callback(null, response.result);
      }
    );
  },

  // Retrieve a single record
  getById: function(id, callback) {
    model.getByIds([id], function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0]);
    });
  },

  // Saving a record
  save: function(bibtex, callback) {
    client.request(
      'save',
      [config.corpus, bibtex, 'bibtex'],
      function(err, response) {
        if (err) return callback(err);

        if (response.error) {
          err = new Error('jsonrpc-fault');
          err.data = response.error;
          return callback(err);
        }

        return callback(null, response.result.rec_id);
      }
    );
  }
};

module.exports = model;

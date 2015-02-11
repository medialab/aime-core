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
  getByIds: function(ids, callback) {
    var stringIds = ids.map(function(ids) {
      return '' + ids;
    });

    client.request(
      'citation_by_rec_ids',
      [config.corpus, stringIds, 'mla', 'html'],
      function(err, response) {
        if (err) return callback(err);

        return callback(null, response.result.map(function(r) {
          return r.mla;
        }));
      }
    );
  },
  getById: function(id, callback) {
    model.getByIds([id], function(err, result) {
      if (err) return callback(err);

      return callback(null, result[0]);
    });
  }
};

module.exports = model;

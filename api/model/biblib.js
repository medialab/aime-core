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
  search: function(callback) {

    var searchParam = {filter_class: 'Document'};

    client.request(
      'search',
      [config.corpus, searchParam],
      function(err, response) {
        if (err) return callback(err);

        if (response.error) {
          err = new Error('jsonrpc-fault');
          err.data = response.error;
          return callback(err);
        }

        return callback(null, response.result.records.map(function(rec) {

          var creators = rec.creators.map(function(creator) {
            if (creator.agent) return creator.agent.name_given + ' ' + creator.agent.name_family;
          }).toString();

          return {
            biblib_id: rec.rec_id,
            text: rec.title + ' — ' + creators,
            html: rec.citations.html.mla
          };
        }));
      }
    );
  },

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

        return callback(null, response.result.map(function(rec) {
          return {
            rec_id: rec.rec_id,
            html: rec.mla
          };
        }));
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

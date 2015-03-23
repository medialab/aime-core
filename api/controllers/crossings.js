/**
 * AIME-core Crossings Controller
 * ===============================
 *
 * Collection of application routes applying only to the crossings interface.
 */
var model = require('../model/crossings.js'),
    _ = require('lodash');

// Constants
var MODES_ORDER = {
  en: [
    'REP',
    'MET',
    'HAB',
    'TEC',
    'FIC',
    'REF',
    'POL',
    'DRO',
    'REL',
    'ATT',
    'ORG',
    'MOR',
    'RES',
    'PRE',
    'DC'
  ],
  fr: [
    'REP',
    'MET',
    'HAB',
    'TEC',
    'FIC',
    'REF',
    'POL',
    'DRO',
    'REL',
    'ATT',
    'ORG',
    'MOR',
    'RES',
    'PRE',
    'DC'
  ]
};

// TODO: authenticate (free for now for dev reasons)
// TODO: check validity of crossing/mode
module.exports = [

  // Retrieve the interface's configuration
  {
    url: '/config',
    action: function(req, res) {

      // TODO: cache
      model.getInfo(req.lang, function(err, stats) {
        if (err) return res.serverError(err);

        return res.ok(_.extend({
          order: MODES_ORDER[req.lang],
          platformuser: 'user'
        }, stats));
      });
    }
  },

  // Related
  {
    url: '/related/:modecross',
    validate: {
      modecross: 'modecross'
    },
    action: function(req, res) {
      model.getRelatedToModecross(req.params.modecross, req.lang, function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  }
];

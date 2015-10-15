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

// Translation helper
function translate(m) {
  if (m === 'NET')
    return 'RES';
  else if (m === 'LAW')
    return 'DRO';
  return m.replace(/NET-/, 'RES-')
          .replace(/LAW-/, 'DRO-')
          .replace(/-NET/, '-RES')
          .replace(/-LAW/, '-DRO');
}

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
          platformuser: req.session.user.role
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
      var modecross = translate(req.params.modecross);

      model.getRelatedToModecross(req.lang, modecross, function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  },

  // Tiles
  {
    url: '/tiles',
    action: function(req, res) {
      model.getTiles(req.lang, function(err, result) {
        if (err) return res.serverError(err);

        return res.ok(result);
      });
    }
  }
];

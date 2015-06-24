/**
 * AIME-core Custom Typology
 * ==========================
 *
 * Some useful custom types for the application.
 */
var Typology = require('typology'),
    bibtex = require('bibtex-parser');

module.exports = new Typology({

  // Bibtex reference
  bibtex: function(v) {
    if (typeof v !== 'string')
      return false;

    var valid;

    try {
      var parsed = bibtex(v);
      valid = !!Object.keys(v).length;
    }
    catch (e) {
      valid = false;
    }

    return valid;
  },

  // NOTE: will coerce strings
  integer: function(v) {
    if (isNaN(v))
      return false;
    else {
      var x = parseFloat(v);
      return (x | 0) === x;
    }
  },

  // List of integer ids
  ids: ['integer'],

  // Possible media kinds
  kind: function(v) {
    return !!~['image', 'quote', 'video', 'pdf', 'link', 'rich'].indexOf(v);
  },

  // Possible lang identifier
  lang: function(v) {
    return v === 'en' || v === 'fr';
  },

  // Mode
  mode: function(v) {
    return /^[A-Z]{2,3}$/.test(v);
  },

  // Crossing
  crossing: function(v) {
    return /^[A-Z]{2,3}-[A-Z]{2,3}$/.test(v);
  },

  // Mode or crossing
  modecross: function(v) {
    return /^[A-Z]{2,3}(-[A-Z]{2,3})?$/.test(v);
  },

  // List of slug ids
  slugs: function(v) {
    return (v instanceof Array) &&
      v.every(function(e) {
        return !!~e.search(/\w{3}_\d+/);
      });
  }
});

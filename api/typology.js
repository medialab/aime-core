/**
 * AIME-core Custom Typology
 * ==========================
 *
 * Some useful custom types for the application.
 */
var Typology = require('typology');

module.exports = new Typology({
  integer: function(v) {
    if (isNaN(v))
      return false;
    else {
      var x = parseFloat(v);
      return (x | 0) === x;
    }
  },
  ids: ['integer'],
  slugs: function(v) {
    return (v instanceof Array) &&
      v.every(function(e) {
        return !!~e.search(/\w{3}_\d+/);
      });
  }
});

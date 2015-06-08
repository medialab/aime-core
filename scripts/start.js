/**
 * AIME-core starting script
 * ==========================
 *
 * This scripts launches the express application serving the inquiry's data.
 */
var app = require('../api/app.js'),
    config = require('../config.json').api,
    biblib = require('../api/model/biblib.js');

app.start(config.port, function() {
  console.log('Server online...');
});

/**
 * AIME-core starting script
 * ==========================
 *
 * This scripts launches the express application serving the inquiry's data.
 */
var app = require('../api/app.js'),
    biblib = require('../api/model/biblib.js');

app.listen(7000);

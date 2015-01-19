/**
 * AIME-core Login Controller
 * ===========================
 *
 * Log users in or out. Nothing too impressive.
 */
var model = require('../model/users.js');

module.exports = [
  {
    url: '/login',
    validate: {
      email: 'string',
      password: 'string'
    },
    methods: ['POST'],
    action: function(req, res) {
      return res.json({ta: 'mère'});
    }
  }
];

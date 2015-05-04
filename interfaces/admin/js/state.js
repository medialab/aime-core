/**
 * AIME-admin application state
 * =============================
 *
 * Exposing the application's state through a Boabab tree.
 */
import Baobab from 'baobab';
import actions from './actions.js';
import createClient from './client.js';

const tree = new Baobab(

  // Data
  {
    lang: null,
    user: null,
    view: null
  },

  // Options
  {
    facets: {
      logged: {
        cursors: {
          user: ['user']
        },
        get: function(data) {
          return !!data.user;
        }
      }
    }
  }
);

// Bindings
tree.client = createClient(tree);
tree.on(actions);

export default tree;

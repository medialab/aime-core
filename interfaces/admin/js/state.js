/**
 * AIME-admin application state
 * =============================
 *
 * Exposing the application's state through a Boabab tree.
 */
import Baobab from 'baobab';
import actions from './actions.js';
import bindClient from './client.js';
import bindFetching from './fetching.js';
import config from '../config.json';
import _ from 'lodash';

// Reading storage
const storageData = JSON.parse(localStorage.getItem(config.storageKey) || '{}');

// State
const state = {

  // Basics
  lang: 'en',
  user: null,
  view: 'home',

  // Views states
  states: {
    book: {
      editor: null,
      selection: null
    },
    voc: {
      editor: null,
      selection: null
    },
    doc:{
      editor: null,
      selection: null
    }
  },

  // Misc data
  data: {
    book: null,
    voc: null,
    doc: null
  }
};

// Tree definition
const tree = new Baobab(

  // Data
  _.merge({}, state, storageData),

  // Options
  {
    facets: {

      // Is the user currently logged?
      logged: {
        cursors: {
          user: ['user']
        },
        get: function({user}) {
          return !!user;
        }
      },

      // Voc index
      vocIndex: {
        cursors: {
          data: ['data', 'voc']
        },
        get: function({data}) {
          return _.indexBy(data, item => 'voc_' + item.slug_id);
        }
      },

      // Doc index
      docIndex: {
        cursors: {
          data: ['data', 'doc']
        },
        get: function({data}) {
          return _.indexBy(data, item => 'doc_' + item.slug_id);
        }
      }
    },
    immutable: true,
    syncwrite: true
  }
);

// Local storage synchronization
const storageFacet = tree.createFacet({
  cursors: {
    lang: ['lang'],
    user: ['user'],
    states: ['states'],
    view: ['view']
  }
});

storageFacet.on('update', function() {
  localStorage.setItem(
    config.storageKey,
    JSON.stringify(storageFacet.get())
  );
});

// Bindings
tree.client = bindClient(tree);
bindFetching(tree);
tree.on(actions);

export default tree;

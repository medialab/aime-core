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
      selected: {
        chapter: null,
        subheading: null
      }
    },
    vocabulary: {
      editor: null,
      selected: null
    },
    documents:{
      editor: null,
      selected: {
        document: null,
        slide: null
      }
    }
  },

  // Misc data
  data: {
    book: null,
    vocabulary: null,
    documents: null
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
        get: function(data) {
          return !!data.user;
        }
      },

      // The selected subheading
      selectedSubheading: {
        cursors: {
          book: ['data', 'book'],
          selected: ['states', 'book', 'selected', 'subheading']
        },
        get: function(data) {
          return _(data.book)
            .map('children')
            .flatten()
            .find({id: data.selected});
        }
      }
    },
    asynchronous: false,
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

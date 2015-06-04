/**
 * AIME-admin application tree
 * ============================
 *
 * Exposing the application's state through a Boabab tree.
 */
import Baobab from 'baobab';
import actions from './actions.js';
import bindClient from './client.js';
import bindFetching from './fetching.js';
import config from '../config.json';
import state from './state.js';
import facets from './facets.js';
import _ from 'lodash';

// Reading storage
const storageData = JSON.parse(localStorage.getItem(config.storageKey) || '{}');

// Tree definition
const tree = new Baobab(

  // Data
  _.merge({}, state, storageData),

  // Options
  {
    facets: facets,
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

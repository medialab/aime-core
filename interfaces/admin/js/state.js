/**
 * AIME-admin application state
 * =============================
 *
 * Exposing the application's state through a Boabab tree.
 */
import Baobab from 'baobab';
import actions from './actions.js';

const tree = new Baobab({
  lang: null,
  logged: false,
  view: null
});

tree.on(actions);

export default tree;

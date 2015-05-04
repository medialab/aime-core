/**
 * AIME-admin router
 * ==================
 *
 * Defining the application's routes.
 */
import tree from './state.js';
import Router from 'baobab-router';

export default new Router(tree, {
  readOnly: [['logged']],
  defaultRoute: '/',
  routes: [

    // Login
    {
      path: '/login',
      state: {
        logged: false,
        view: 'login'
      }
    },

    // Home
    {
      path: '/',
      state: {
        logged: true,
        view: null
      }
    }
  ]
});

/**
 * AIME-admin router
 * ==================
 *
 * Defining the application's routes.
 */
import tree from './state.js';
import Router from 'baobab-router';

export default new Router(tree, {
  readOnly: [['user']],
  defaultRoute: '/',
  routes: [

    // Login
    {
      path: '/login',
      state: {
        user: null,
        view: 'login'
      }
    },

    // Home
    {
      path: '/',
      state: {
        view: null
      }
    }
  ]
});

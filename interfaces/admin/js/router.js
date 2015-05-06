/**
 * AIME-admin router
 * ==================
 *
 * Defining the application's routes.
 */
import tree from './state.js';
import Router from 'baobab-router';

export default new Router(tree, {
  defaultRoute: '/',
  routes: [

    // Login
    {
      path: '/login',
      facets: {
        logged: false
      },
      state: {
        view: 'login'
      }
    },

    // Home
    {
      path: '/',
      facets: {
        logged: true
      },
      state: {
        view: null
      }
    }
  ]
});

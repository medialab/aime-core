/**
 * AIME-admin router
 * ==================
 *
 * Defining the application's routes.
 */
import tree from './state.js';
import Router from 'baobab-router';

// NOTE: problemn is with the slash / route
export default new Router(tree, {
  defaultRoute: '/home',
  routes: [

    // Home
    {
      path: '/home',
      facets: {
        logged: true
      },
      state: {
        view: 'home'
      }
    },

    // Book
    {
      path: '/book',
      facets: {
        logged: true
      },
      state: {
        view: 'book'
      }
    },

    // Login
    {
      path: '/login',
      facets: {
        logged: false
      },
      state: {
        view: 'login'
      }
    }
  ]
});

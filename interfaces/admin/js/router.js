/**
 * AIME-admin router
 * ==================
 *
 * Defining the application's routes.
 */
import tree from './state.js';
import Router from 'baobab-router';

export default new Router(tree, {
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

    {
      defaultRoute: '/',
      facets: {
        logged: true
      },
      routes: [

        // Home
        {
          path: '/',
          state: {
            view: 'home'
          }
        },

        // Book
        {
          path: '/book',
          state: {
            view: 'book'
          }
        }
      ]
    }
  ]
});

/**
 * AIME-admin API Client
 * ======================
 *
 * A simple djax-client providing access to the AIME-core API.
 */
import Client from 'djax-client';
import config from '../config.json';

export default function(scope) {
  return new Client({
    settings: {
      scope: scope,
      baseUrl: config.api
    },
    defaults: {
      contentType: 'application/json',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      }
    },
    services: {

      // Session retrieval
      session: {
        url: '/session',
        success: function({result}) {
          this.set('user', result.user || null);
        }
      },

      // Login
      login: {
        url: '/login',
        type: 'POST',
        success: function({result}) {
          this.set('user', result || null);
        }
      },

      // Logout
      logout: {
        url: '/logout',
        type: 'POST',
        success: function() {
          this.set('user', null);
        }
      },

      // Book data
      book: {
        url: '/book',
        success: function({result}) {
          this.set(['data', 'book'], result);
        }
      }
    }
  });
}

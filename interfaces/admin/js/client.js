/**
 * AIME-admin API Client
 * ======================
 *
 * A simple djax-client providing access to the AIME-core API.
 */
import Client from 'djax-client';
import config from '../config.json';
import {generateDocMarkdown} from './lib/helpers.js';

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

      // Switching language
      lang: {
        type: 'POST',
        url: '/lang/:lang'
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
      },

      // Vocabulary data
      voc: {
        url: '/voc',
        success: function({result}) {
          this.set(['data', 'voc'], result);
        }
      },

      // Ressource data
      res: {
        url: '/res',
        success: function({result}) {
          this.set(['data', 'res'], result);
        }
      },

      // Document data
      doc: {
        url: '/doc',
        success: function({result}) {

          // Generating the monolithic markdown version
          const data = result.forEach(function(doc) {
            doc.markdown = generateDocMarkdown(doc);
          });

          this.set(['data', 'doc'], result);
        }
      },

      // Creating a document
      createDoc: {
        url: '/doc',
        type: 'POST'
      },

      // Updating a document
      updateDoc: {
        url: '/doc/:id',
        type: 'PUT'
      },

      // Creating a resource
      createRes: {
        url: '/res/:kind',
        type: 'POST'
      }
    }
  });
}

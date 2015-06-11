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

      // Document data
      // TODO: drop the limit when not debugging anymore
      doc: {
        url: '/doc?limit=15',
        success: function({result}) {

          // Generating the monolithic markdown version
          const data = result.forEach(function(doc) {
            doc.markdown = doc.children.map(function(slide) {
              return slide.children
                .map(e => {
                  if (e.type === 'paragraph')
                    return e.markdown;
                  else
                    return `![${e.type}](${e.type === 'reference' ? 'ref' : 'res'}_${e.slug_id})`;
                }).join('\n\n');
            }).join('\n\n---\n\n');
          });

          this.set(['data', 'doc'], result);
        }
      },

      // Creating a document
      docCreate: {
        url: '/doc',
        type: 'POST'
      }
    }
  });
}

/**
 * AIME-admin application facets
 * ==============================
 *
 * Computational data flowing through the application.
 */
import parser from './lib/parser.js';
import _ from 'lodash';

export default {

  // Is the user currently logged?
  logged: {
    cursors: {
      user: ['user']
    },
    get: function({user}) {
      return !!user;
    }
  },

  // Voc index
  vocIndex: {
    cursors: {
      data: ['data', 'voc']
    },
    get: function({data}) {
      return _.indexBy(data, item => 'voc_' + item.slug_id);
    }
  },

  // Doc index
  docIndex: {
    cursors: {
      data: ['data', 'doc']
    },
    get: function({data}) {
      return _.indexBy(data, item => 'doc_' + item.slug_id);
    }
  },

  // Book parsed buffer
  bookParsed: {
    facets: {
      voc: 'vocIndex',
      doc: 'docIndex'
    },
    cursors: {
      edited: ['states', 'book', 'editor']
    },
    get: function({edited, voc, doc}) {
      if (!edited)
        return null;

      const parsed = parser(edited);

      // Associating linked elements
      parsed.data.vocs = parsed.data.vocs.map(v => voc[v]);
      parsed.data.docs = parsed.data.docs.map(d => doc[d]);

      return parsed;
    }
  }
};

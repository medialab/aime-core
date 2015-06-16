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

  // Resources index
  resIndex: {
    cursors: {
      data: ['data', 'doc']
    },
    get: function({data}) {

      let d = _.map(data, doc => {
        return doc.children.map( slide => {
          return slide.children.map(e => {
            if (e.type !== 'paragraph') return e;
          });
        })
      });
      d = _.flatten(d, 3);
      d = _.pull(d,  undefined);

      return _.indexBy(d, item => { 
        return (item.type === "reference" ? "ref" : "res") + "_" + item.slug_id
      });
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
      if (!edited && edited !== '')
        return null;

      const parsed = parser(edited);

      // Associating linked elements
      parsed.data.vocItems = parsed.data.vocs.map(v => voc[v]);
      parsed.data.docItems = parsed.data.docs.map(d => doc[d]);

      return parsed;
    }
  },

  // Document parsed buffer
  docParsed: {
    cursors: {
      edited: ['states', 'doc', 'editor']
    },
    get: function({edited}) {
      if (!edited && edited !== '')
        return null;

      const parsed = parser(edited);

      return parsed;
    }
  }
};

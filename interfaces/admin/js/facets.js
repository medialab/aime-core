/**
 * AIME-admin application facets
 * ==============================
 *
 * Computational data flowing through the application.
 */
import parser from './lib/parser.js';
import {ressourceRender} from './lib/parser.js';
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
      resData: ['data', 'res'],
      docData: ['data', 'doc']
    },
    get: function({resData, docData}) {

      const resIndex = _.indexBy(resData, item => {
        return 'res_' + item.slug_id;
      });

      const refIndex = _(resData)
        .map('reference')
        .compact()
        .indexBy(item => 'ref_' + item.slug_id)
        .value();

      const docRefIndex = _(docData)
        .map('children')
        .map(d => _.map(d, 'children'))
        .flattenDeep()
        .filter({type: 'reference'})
        .indexBy(item => 'ref_' + item.slug_id)
        .value();

      return _.extend(refIndex, resIndex, docRefIndex);
    }
  },

  // Users index
  usersIndex: {
    cursors: {
      users: ['data', 'users']
    },
    get: function({users}) {
      return _.indexBy(users, user => user.id);
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

  // Resource parsed buffer
  resParsed: {
    cursors: {
      edited: ['states', 'res', 'editor'],
      state: ['states', 'res']
    },get: function({edited, state}){
      if (!edited && edited !== '')
        return null;

      return ressourceRender(state.editor);
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

/**
 * AIME-admin Actions
 * ===================
 *
 * Actions updating the application's state.
 */
import _ from 'lodash';
import {generateDocMarkdown} from './lib/helpers.js';

const actions = {

  /**
   * Login
   */
  'login:attempt': function({data}) {
    if (!data.email || !data.password)
      return;

    // Calling service
    this.set('login', true);
    this.client.login({data: data}, err => {
      this.set('login', false);
    });
  },

  /**
   * Logout
   */
  'logout': function() {
    this.client.logout();
  },

  /**
   * Changing the current language
   */
  'lang:change': function({data}) {
    if (this.get('lang') === data)
      return;

    // Effectively changing client's lang
    this.client.lang({params: {lang: data}}, () => {

      // Changing the lang
      this.set('lang', data);

      // Clearing fetched data
      this.set('data', null);

      // Clearing states
      this.set('states', null);
    });
  },

  /**
   * Changing the current view
   */
  'view:change': function({data}) {
    if (this.get('view') === data)
      return;
    this.set('view', data);
  },

  /**
   * Selecting data
   */
  'selection:change': function({data: {model, level, target}}) {
    const cursor = this.select('states', model, 'selection'),
          selection = cursor.get();


    this.set(['states', model, 'modal'], null);

    // Ensuring we are acting on an array
    if (!selection)
      cursor.set([]);

    cursor.set(level, target);

    // If we are handling a document, there is only one level
    if (model === 'doc') {
      const item = _.find(this.get('data', model), {id: target});
      const parent = cursor.up();
      parent.set('title', item.title);
      parent.set('author', item.author.id);
      parent.set('status', item.status);
      parent.set('searching', false);
      parent.set('linking', null);
      return parent.set('editor', item.markdown);
    }

    if(model === 'res'){
      const item = _.find(this.get('data', model), {id: target});
      this.set(['states', model, 'editor'], item);
    }

    // If level is 1, we initialize the editor
    if (level === 1) {
      const data = this.get('data', model);

      const item = _(data)
        .map('children')
        .flatten()
        .find({id: target});

      cursor.set(2, 0);
      cursor.up().set('editor', item.children[0].markdown);
    }

    // If level is 2, we change the editor buffer only
    if (level === 2) {
      const data = this.get('data', model);

      const item = _(data)
        .map('children')
        .flatten()
        .find({id: selection[1]});

      cursor.up().set('editor', item.children[target].markdown);
    }
  },

  /**
   * Adding from modal
   */
  'modal:create': function(payload) {
    const model = payload.data.model;


    if (model === 'doc') {
      const {title, author} = payload.data;
      this.client.createDoc(
        {data: {title, author}},
        (err, data) => {
          data.result.markdown = generateDocMarkdown(data.result);
          this.unshift(['data', model], data.result);
          this.emit('selection:change',{model: model, level: 0, target: data.result.id});
        }
      );
    }

    else if (model === 'res') {
      const {data} = payload.data;

      this.client.createRes(
        {
          data: {
            ...data,
            reference: data.reference ?
              data.reference.biblib_id :
              null
          },
          params: {
            kind: data.kind
          }
        },
        (err, data) => {
          this.unshift(['data', model], data.result);
          this.emit('selection:change', {model: model, level: 0, target: data.result.id});
        }
      );
    }
  },

  /**
   * update element
   */
  'element:save': function({data: {model, status}}) {
    // Document
    if (model === 'doc') {
      this.set(['states','doc','saving'], true);
      this.client.updateDoc(
        {
          data: {
            status: status,
            slides: this.data.states[model].editor,
            title: this.data.states[model].title,
            author: this.data.states[model].author
          },
          params: {
            id: this.data.states[model].selection[0]
          }
        },
        (err, data) => {
          const doc = data.result;

          // Generating markdown slide
          doc.markdown = generateDocMarkdown(doc);

          // We are done saving
          this.set(['states','doc','saving'], false);

          // We update the data
          this.set(['data', model, {id: doc.id}], doc);
          this.set(['states', model, 'status'], doc.status);
        }
      );
    }

    // Resource
    if (model === 'res') {

      const editor = this.data.states[model].editor;

      this.client.updateRes(
        {
          data: {
            ...editor,
            reference: editor.reference.biblib_id
          },
          params: {
            id: editor.id
          }
        },
        (err, data) => {
          const payload = data.result;
          const resArray = this.data.data[model];
          const id = _.findIndex(resArray, o => o.id === payload.id);
          this.set(['data', model, id], payload);
        }
      );
    }
  },

  /**
   * toogle Help
   */
  'help:toogle': function() {
    this.set(['states', 'help'], !this.get(['states', 'help']) );
  },


  /**
   * Opening modal
   */
  'modal:open': function({data: {model,type}}) {
    this.set(['states', model, 'modal'], type);
  },

  'modal:dismiss': function({data: {model}}) {
    this.set(['states', model, 'modal'], null);
  },

  /**
   * Blf modals
   */
  'blfModal:open': function({data: {model,type}}) {
    this.set(['states', model, 'blfModal'], type);
  },

  'blfModal:dismiss': function({data: {model}}) {

    this.set(['states', model, 'refreshing'], true);

    this.client.ref(() => {
      this.set(['states', model, 'refreshing'], false);
      this.set(['states', model, 'blfModal'], null);
    });
  },

  /**
   * Adding a resource through the selector
   */
  'resSelector:open': function({data: {model}}) {
    this.set(['states', model, 'searching'], true);
    this.set(['states', 'doc', 'linking'], null);
    this.commit();
  },
  'resSelector:dismiss': function({data: {model}}) {
    this.set(['states', model, 'searching'], false);
    this.commit();
  },

  /**
   * Linking documents to either book or voc
   */
  'linkSelector:open': function({data: {type}}) {
    this.set(['states', 'doc', 'linking'], type);
    this.set(['states', 'doc', 'searching'], false);
    this.commit();
  },
  'linkSelector:dismiss': function() {
    this.set(['states', 'doc', 'linking'], null);
    this.commit();
  },

  /**
   * Updating the editor's buffer
   */
  'buffer:change': function({data: {model, markdown}}) {
    this.set(['states', model, 'editor'], markdown);
    this.commit();
  },

  /**
   * Updating the title's buffer
   */
  'title:change': function({data: {model, title}}) {
    this.set(['states', model, 'title'], title);
    this.commit();
  },

  /**
   * Updating the author's ID
   */
  'author:change': function({data: {model, author}}) {
    this.set(['states', model, 'author'], author);
    this.commit();
  },

  /**
   * Updating the reference's ID
   */
  'ref:change': function({data: data}) {
    this.set(['states', 'res', 'editor' ,'reference'], data.ref.value);
    this.commit();
  },

  /**
   * Updating the resource selector fields
   */
  'resource:change': function({data: {model, payload}}) {
    const cursor = 'states.' + model + '.editor.' + payload.fieldName;
    this.set(cursor.split('.'), payload.fieldValue);
    this.commit();
  },

  /**
   * Deleting a resource
   */
  'resource:delete': function() {
    const id = this.get('states', 'res', 'selection', 0);

    this.client.deleteRes({params: {id}}, (err, result) => {
      if (err) {

        // Notifying the user
        const xhr = err.xhr;

        result = JSON.parse(xhr.responseText);

        const docs = result.error.reason
          .map(doc => '  - ' + doc)
          .join('\n');

        const message = `Cannot delete this resource because it is used by the following documents:\n${docs}`;

        return alert(message);
      }

      const res = this.get('data', 'res');

      const index = res.findIndex(r => r.id === id);

      this.splice(['data', 'res'], [index, 1]);
      this.set(['states', 'res', 'selection'], null);
    });
  },

  /**
   * Adding a link
   */
  'link:add': function({data}) {

    this.client.createLink({data}, (err, response) => {
      const markdown = response.result;

      if (data.model === 'voc') {
        const finder = voc => voc.id === data.idVoc;

        const voc = this.select('data', 'voc', finder);
        voc.set(['children', p => p.id === data.idFrom, 'markdown'], markdown);
        this.commit();
      }
      else if (data.model === 'book') {
        const chapterFinder = chapter => chapter.id === data.idChapter,
              subchapterFinder = subchapter => subchapter.id === data.idSubchapter;

        const book = this.select('data', 'book', chapterFinder, 'children', subchapterFinder);

        book.set(['children', p => p.id === data.idFrom, 'markdown'], markdown);
        this.commit();
      }
    });
  },

  /**
   * Deleting a link
   */
  'link:delete': function({data}) {
    this.client.deleteLink({data}, (err, response) => {
      const markdown = response.result;

      if (data.model === 'voc') {
        const finder = voc => voc.id === data.idVoc;

        const voc = this.select('data', 'voc', finder);
        voc.set(['children', p => p.id === data.idFrom, 'markdown'], markdown);
        this.commit();
      }
      else if (data.model === 'book') {
        const chapterFinder = chapter => chapter.id === data.idChapter,
              subchapterFinder = subchapter => subchapter.id === data.idSubchapter;

        const book = this.select('data', 'book', chapterFinder, 'children', subchapterFinder);

        book.set(['children', p => p.id === data.idFrom, 'markdown'], markdown);
        this.commit();
      }
    });
  }
};

export default actions;

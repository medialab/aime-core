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
   * Login to the API
   */
  'login:attempt': function({data}) {
    if (!data.email || !data.password)
      return;

    // Calling service
    this.client.login({data: data});
  },

  /**
   * Changing the current language
   */
  'lang:change': function({data}) {
    if (this.get('lang') === data)
      return;

    // Changing the lang
    this.set('lang', data);

    // Clearing fetched data
    this.set('data', {});

    // Clearing states
    this.set('states', null);

    // Effectively changing client's lang
    this.client.lang({params: {lang: data}});
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

    // Ensuring we are acting on an array
    if (!selection)
      cursor.set([]);

    cursor.set(level, target);

    // If we are handling a document, there is only one level
    if (model === 'doc') {
      const item = _.find(this.get('data', model), {id: target});
      return cursor.up().set('editor', item.markdown);
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
  'modal:create': function({data: {model,data}}) {

    this.client.createDoc(
      {data: {title: data}},
      (err, data) => {

        data.result.markdown = generateDocMarkdown(data.result);

        this.unshift(['data', model], data.result)
        this.emit('selection:change', {model:model, level:0, target:data.result.id});
      }
    );
  },

  /**
   * update element
   */
  'element:save': function({data: {model} }) {

    this.set(['states','doc','saving'], true);
    this.client.updateDoc(
      {data: {slides:this.data.states[model].editor}, params: {id:this.data.states[model].selection[0]}},
      (err, data) => {
        this.set(['states','doc','saving'], false);
      }
    )
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
   * Updating the editor's buffer
   */
  'buffer:change': function({data: {model, markdown}}) {
    this.set(['states', model, 'editor'], markdown);
    this.commit();
  }
};

export default actions;

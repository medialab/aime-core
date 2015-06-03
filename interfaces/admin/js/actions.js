/**
 * AIME-admin Actions
 * ===================
 *
 * Actions updating the application's state.
 */
import _ from 'lodash';

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
   * Updating the editor's buffer
   */
  'buffer:change': function({data: {model, markdown}}) {
    this.set(['states', model, 'editor'], markdown);
    this.commit();
  }
};

export default actions;

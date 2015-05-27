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
          selection = cursor.get() || [];

    selection[level] = target;
    cursor.set(selection);

    // If level is > 0, we initialize the editor
    if (level > 0) {
      const data = this.get('data', model);

      const item = _(data)
        .map('children')
        .flatten()
        .find({id: selection[1]});

      cursor.up().set('editor', item.children[0].markdown);
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

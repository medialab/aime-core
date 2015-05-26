/**
 * AIME-admin Actions
 * ===================
 *
 * Actions updating the application's state.
 */
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
   * Selecting a chapter
   */
  'chapter:select': function({data}) {
    const path = ['states', 'book', 'selected', 'chapter'],
        selected = this.get(path);

    if (data === selected)
      this.set(path, null);
    else
      this.set(path, data);
  },

  /**
   * Selecting a subheading
   */
  'subheading:select': function({data}) {
    const cursor = this.select('states', 'book');

    cursor.set(['selected', 'subheading'], data);
    cursor.set('editor',
      this.facets.selectedSubheading.get().children[0].markdown);
  },

  /**
   * Updating the editor's buffer
   */
  'buffer:change': function({data: {path, markdown}}) {
    this.set(path, markdown);
    this.commit();
  }
};

export default actions;

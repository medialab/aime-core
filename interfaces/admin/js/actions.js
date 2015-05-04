/**
 * AIME-admin Actions
 * ===================
 *
 * Actions updating the application's state.
 */
const actions = {

  // Changing the current language
  'lang:change': function({data}) {
    if (this.get('lang') === data)
      return;

    this.set('lang', data);
  }
};

export default actions;

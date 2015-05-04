/**
 * AIME-admin Actions
 * ===================
 *
 * Actions updating the application's state.
 */
const actions = {

  // Login attempt
  'login:attempt': function({data}) {
    console.log('ici', data);
  },

  // Changing the current language
  'lang:change': function({data}) {
    if (this.get('lang') === data)
      return;

    this.set('lang', data);
  }
};

export default actions;

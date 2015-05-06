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

    this.set('lang', data);
  }
};

export default actions;

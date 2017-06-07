/**
 * AIME-admin application state
 * =============================
 *
 * Default application state.
 */
export default {

  // Basics
  lang: 'en',
  user: null,
  view: 'home',

  // Basic state
  login: false,

  // Views states
  states: {
    book: {
      editor: null,
      selection: null
    },
    voc: {
      editor: null,
      selection: null
    },
    doc: {
      editor: null,
      title: null,
      selection: null,
      modal: null,
      author:null,
      searching: false
    },
    res: {
      editor: null,
      selection: null,
      modal: null,
      blfModal: null,
    },
    help: false
  },

  // Misc data
  data: {
    users: null,
    book: null,
    voc: null,
    doc: null,
    res: null,
    ref: null
  }
};

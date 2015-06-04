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
    doc:{
      editor: null,
      selection: null
    }
  },

  // Misc data
  data: {
    book: null,
    voc: null,
    doc: null
  }
};

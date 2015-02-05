/**
 * AIME-core Cache
 * ================
 *
 * A lot of queries to the database are going to be done quite a high amount of
 * times. We are going to cache those here so that the database is not queried
 * in vain.
 *
 * The query retrieving the whole book or parts of it is a very good example
 * of this.
 */

// Exposing structure
module.exports = {
  en: {
    book: null,
    vocabulary: null,
    documents: null
  },
  fr: {
    book: null,
    vocabulary: null,
    documents: null
  }
};

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
 *
 * This is also where maximum slug ids are kept in order to avoid costly
 * queries to the database when adding new elements to it.
 */

// Exposing structure
module.exports = {
  en: {
    book: null,
    vocabulary: null,
    documents: null,
    resources: null
  },
  fr: {
    book: null,
    vocabulary: null,
    documents: null,
    resources: null
  },
  slug_ids: {
    voc: 0,
    doc: 0,
    res: 0,
    ref: 0
  }
};

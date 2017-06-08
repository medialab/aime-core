/**
 * AIME-core Bookmark Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').link,
    async = require('async'),
    tokenizer = require('../../lib/tokenizer.js');

function getSlug(target){

  let prefix = undefined;
  if (target.type === 'document')
      prefix =  'doc_';
  if (target.type === 'vocabulary')
      prefix =  'voc_';
  if (!prefix)
    throw new Error("link target must be a vocabulary or document");
  else
    return prefix+target.slug_id;
}

module.exports = {
 
  create: function(idFrom, idTo, indexSentence, userId, callback) {
    let paragraph = null;
    let target = null;

    async.waterfall([
      // link exists ? 
      function linkExists(next){
        db.query(queries.get, {idFrom: idFrom, idTo:idTo},function(err, result){
          if (err) return next(err);
          if (result[0].link)
            return callback(new Error("linkExists"));
          else
            next(null, result[0].paragraph,result[0].target)
        })
      },
      function getParagraph(paragraph, target, next){
        // tokenize les sentences du markdown
       
        const sentences = tokenizer(paragraph.markdown);
        console.log(sentences[indexSentence])
        // ajouter le slug_id à la fin de la sentence
        const groups = sentences[indexSentence].match(/(.*?)(\{(.*?)\})?(\W)$/)
        console.log(groups)
        // links preexists, add our link
        const links = groups[3] ? groups[3]+","+getSlug(target) : getSlug(target)
        sentences[indexSentence] = groups[1]+'{'+links+'}'+groups.slice(-1)
        db.save(paragraph, 'markdown', sentences.join(' '), next)
      },
      // création du lien
      function(next){
        db.query(queries.create, {idFrom: idFrom, idTo:idTo}, callback);  
      }
    ]);
  },
  destroy: function(idFrom, idTo, callback) {
    db.query(queries.destroy, {idFrom: idFrom, idTo:idTo}, callback);
  }
};

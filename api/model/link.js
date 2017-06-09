/**
 * AIME-core Bookmark Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').link,
    async = require('async'),
    tokenizer = require('../../lib/tokenizer.js'),
    MARKDOWN_LINKS_RE = /(.*?)(\{(.*?)\})?([.?!…]+)$/;

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
      function editMarkdown(paragraph, target, next){
        // tokenize les sentences du markdown
       
        const sentences = tokenizer(paragraph.markdown);
        // ajouter le slug_id à la fin de la sentence
        const groups = sentences[indexSentence].match(MARKDOWN_LINKS_RE)
        // links preexists, add our link
        const links = groups[3] ? groups[3]+","+getSlug(target) : getSlug(target)
        sentences[indexSentence] = groups[1]+'{'+links+'}'+groups[4]
        db.save(paragraph, 'markdown', sentences.join(' '), next)
      },
      // création du lien
      function createLink(next){
        db.query(queries.create, {idFrom: idFrom, idTo:idTo}, callback);  
      }
    ]);
  },
  destroy: function(idFrom, idTo, indexSentence, userId, callback) {
    let paragraph = null;
    let target = null;

    async.waterfall([
      // link exists ? 
      function linkExists(next){
        db.query(queries.get, {idFrom: idFrom, idTo:idTo},function(err, result){
          if (err) return next(err);
          if (!result[0].link)
            return callback(new Error("linkDoesNotExists"));
          else
            next(null, result[0].paragraph,result[0].target)
        })
      },
      function editMarkdown(paragraph, target, next){
        // tokenize les sentences du markdown
        const sentences = tokenizer(paragraph.markdown);
        // ajouter le slug_id à la fin de la sentence
        const groups = sentences[indexSentence].match(MARKDOWN_LINKS_RE);
        if (groups[3]){
          // links exists, remove our link
          let links = groups[3].split(',').filter(function(l){ return l !== getSlug(target)}).join(',');
          links = links !== '' ? '{'+links+'}' : links
          sentences[indexSentence] = groups[1]+links+groups[4];
          db.save(paragraph, 'markdown', sentences.join(' '), next);
        }
        else
          next(null);
      },
      // création du lien
      function deleteLink(next){
        db.query(queries.destroy, {idFrom: idFrom, idTo:idTo}, callback);  
      }
    ]);
  }
};

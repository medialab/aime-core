/**
 * AIME-core Markdown Parser
 * ==========================
 *
 * Overriding a marked parser to parse some data from the markdown.
 */
var marked = require('marked'),
    _ = require('lodash');

/**
 * Constants
 */
var RE_DOCS = /\{(doc_\d+(?:,doc_\d+)*)\}/g,
    RE_VOC = /^voc_\d+$/;

/**
 * Helpers
 */
function before(decorator, target) {
  return function() {
    var args = Array.prototype.slice.call(arguments);

    var ret = decorator.apply(null, args);
    args.push(ret);

    return target.apply(null, args);
  };
}

function multimatch(regex, string) {
  var matches = [],
      match;

  while (match = regex.exec(string))
    matches.push(match);

  regex.lastIndex = 0;

  return matches;
}

/**
 * Forge
 */
module.exports = function(customRenderer) {
  return function(markdownString) {
    markdownString = markdownString || '';

    // Parsed data
    var data = {
      docs: [],
      vocs: [],
      res: []
    };

    // Monkey patching
    customRenderer.paragraph = before(
      function(txt) {
        var docs = _(multimatch(RE_DOCS, txt))
          .map(function(m) {
            return m[1].split(',');
          })
          .flatten()
          .uniq()
          .value();

        data.docs = data.docs.concat(docs);

        return docs;
      },
      customRenderer.paragraph
    );

    customRenderer.link = before(
      function(href, title, text) {
        var m = href.match(RE_VOC);

        if (m)
          data.vocs.push(m[0]);
      },
      customRenderer.link
    );

    customRenderer.image = before(
      function(src) {
        data.res.push(src);
      },
      customRenderer.image
    );

    // Rendering method
    var markdown = marked(markdownString, {renderer: customRenderer});

    return {
      html: markdown,
      data: _.mapValues(data, _.uniq)
    };
  };
};

/**
 * AIME-core Markdown Stripper
 * ============================
 *
 * Custom marked renderer aiming at stripping markdown syntax elements to
 * retrieve raw text.
 */
var marked = require('marked'),
    renderer = new marked.Renderer(),
    _ = require('lodash');

var RE_DOCS = /{(doc_\d+(?:,doc_\d+)*)}/g;

renderer.paragraph = function(txt) {
  return txt.replace(RE_DOCS, '');
};

renderer.link = function(href, title, text) {
  return text;
};

renderer.strong = _.identity;
renderer.em = _.identity;

module.exports = function(markdownString) {
  return marked(markdownString, {renderer: renderer});
};

/**
 * AIME-admin Parser
 * ==================
 *
 * The custom markdown parser able to check some data about the given string
 * as well as rendering it correctly.
 */
import marked, {Renderer} from 'marked';
import tokenize from '../../../../lib/tokenizer.js';

/**
 * Constants
 */
const RE_DOCS = /{(doc_\d+(?:,doc_\d+)*)}/,
      RE_VOC = /^voc_\d+$/;

/**
 * Parsing function
 */
export default function(string) {
  const renderer = new Renderer();

  string = string || '';

  const originals = {
    link: renderer.link
  };

  const data = {
    docs: [],
    vocs: []
  };

  // Paragraphs
  renderer.paragraph = function(txt) {
    var sentences = tokenize(txt),
        docs = _(sentences)
          .map(t => (t.match(RE_DOCS) || [])[1])
          .compact()
          .map(t => t.split(','))
          .flatten()
          .uniq()
          .value();

    // Adding docs to data
    data.docs = data.docs.concat(docs);

    return `<p>${txt}</p>`;
  };

  // Links
  renderer.link = function(href) {
    var m = href.match(RE_VOC);

    if (m)
      data.vocs.push(m[0]);

    return originals.link.apply(this, arguments);
  };

  var markdown = marked(string, {renderer: renderer});
  return {
    markdown: markdown,
    data: data
  };
}

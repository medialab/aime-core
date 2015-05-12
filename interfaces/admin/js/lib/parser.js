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
const RE_DOCS = /{(doc_\d+(?:,doc_\d+)*)}/;

/**
 * Parsing function
 */
export default function(string) {
  const renderer = new Renderer();

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
    data.docs.push(docs);

    return `<p>${txt}</p>`;
  };

  // Links
  renderer.link = function(href, title, text) {
    console.log(href, title, text);

    return originals.link.apply(this, arguments);
  };

  return marked(string, {renderer: renderer});
}

/**
 * AIME-core Generic Helpers
 * ==========================
 *
 * Collection of helpers used throughout the code.
 */

/**
 * Creating a document's full markdown from its data
 */
export function generateDocMarkdown(doc){
  return doc.children.map(slide => {
    return slide.children
      .map(e => {
        if (e.type === 'paragraph')
          return e.markdown;
        else
          return `![${e.type}](${e.type === 'reference' ? 'ref' : 'res'}_${e.slug_id})`;
    }).join('\n\n');
  }).join('\n\n---\n\n');
}

/**
 * Extrapolation the name of a resource from its data
 */
export function resourceName(res) {
  let text = false;

  if (res.reference !== null && typeof res.reference !== 'undefined')
    text = res.reference.text;


  var values = _([
    _.trunc(res.title),
    _.trunc(res.text),
    _.trunc(text),
    res.url,
    res.original
  ])
  .compact()
  .map(function(d){ return  ' '+d })
  .toString()
  ;

  return values || res.path || '?';
}

/**
 * Reading an input file
 */
export function readInputFile(file, callback) {
  const reader = new FileReader();

  reader.onloadend = function(e) {
    return callback(null, e.target.result);
  };

  reader.readAsDataURL(file);
}

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

  let values = _([
    res.title,
    res.text,
    text,
    res.url,
    res.original
  ])
  .compact()
  .value()

  const fragmentLength =  Math.round(240 / values.length);

  let valuesShort = _(values)
    .map(function(d){ return ' ' +  _.trunc(d, fragmentLength) })
    .toString()

  return valuesShort || res.path || '?';
}

/**
 * Asking user to confirm a dramatic operation
 */
export function confirmProductionOperation () {
  const msg = 'This operation will produce direct changes on the public website. Continue ?';
  return confirm(msg);
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

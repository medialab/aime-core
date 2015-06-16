export function generateDocMarkdown(doc){

  return doc.children.map(function(slide) {
    return slide.children
      .map(e => {
        if (e.type === 'paragraph')
          return e.markdown;
        else
          return `![${e.type}](${e.type === 'reference' ? 'ref' : 'res'}_${e.slug_id})`;
    }).join('\n\n');
  }).join('\n\n---\n\n');    
}
// name: getAll
// Retrieve every vocabulary element sorted alphabetically
MATCH (v:Vocabulary {lang: {lang}})-[r:HAS]-(p:Paragraph)
WITH v, r, {id: id(p), properties: p} AS paragraphs ORDER BY r.order
RETURN {vocabulary: {id: id(v), properties: v}, children: collect(paragraphs)} AS item
ORDER BY item.vocabulary.properties.title;

// name: getByIds
// Retrieve one or more vocabulary entries by id
START n=node({ids})
MATCH (n)-[r:HAS]-(p:Paragraph)
WITH n, r, {id: id(p), properties: p} AS paragraphs ORDER BY r.order
RETURN {vocabulary: {id: id(n), properties: n}, children: collect(paragraphs)}

// name: getAll
// Retrieve every vocabulary element sorted alphabetically
MATCH (v:Vocabulary {lang: {lang}})-[r:HAS]-(p:Paragraph)
WITH v, r, {id: id(p), properties: p} AS paragraphs ORDER BY r.order
RETURN {id: id(v), properties: v} AS vocabulary, collect(paragraphs) AS paragraphs ORDER BY vocabulary.properties.title;

// name: getById
// Retrieve a single vocabulary entry by its id
START n=node({id})
MATCH (n)-[r:HAS]-(p:Paragraph)
WITH n, r, {id: id(p), properties: p}

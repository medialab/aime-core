// name: getAll
// Retrieve every document sorted alphabetically
MATCH (d:Document {lang: {lang}, status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WITH d, rs, s, re, {id: id(e), properties: e} AS elements ORDER BY re.order
WITH d, rs, s, {slide: {id: id(s), properties: s}, children: collect(elements)} AS slides ORDER BY rs.order
RETURN {document: {id: id(d), properties: d}, children: collect(slides)} AS item
ORDER BY item.document.properties.title
SKIP {offset}
LIMIT {limit};

// name: getBySlugIds
// Retrieve one or more document by their slug ids.
MATCH (d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE d.slug_id IN {slug_ids}
WITH d, rs, s, re, {id: id(e), properties: e} AS elements ORDER BY re.order
WITH d, rs, s, {slide: {id: id(s), properties: s}, children: collect(elements)} AS slides ORDER BY rs.order
RETURN {document: {id: id(d), properties: d}, children: collect(slides)} AS item;

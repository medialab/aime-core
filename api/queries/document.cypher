// name: getAll
// Retrieve every document sorted alphabetically
MATCH (d:Document {lang: {lang}, status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
MATCH (d)-[:CREATED_BY]-(a:User)
OPTIONAL MATCH (r:Reference)-[:DESCRIBES]->(e)
OPTIONAL MATCH (d)-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH a, d, rs, s, re, {id: id(e), properties: e, reference: r} AS elements, collect(DISTINCT id(bp)) AS bpids ORDER BY re.order
WITH bpids, a, d, rs, s, {slide: {id: id(s), properties: s}, children: collect(elements)} AS slides ORDER BY rs.order
RETURN {document: {id: id(d), properties: d, author: {name: a.name, surname: a.surname}, cited_by: bpids}, children: collect(slides)} AS item
ORDER BY item.document.properties.title
SKIP {offset}
LIMIT {limit};

// name: getBySlugIds
// Retrieve one or more document by their slug ids.
MATCH (d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
MATCH (d)-[:CREATED_BY]-(a:User)
OPTIONAL MATCH (r:Reference)-[:DESCRIBES]->(e)
OPTIONAL MATCH (d)-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WHERE d.slug_id IN {slug_ids}
WITH a, d, rs, s, re, {id: id(e), properties: e, reference: r} AS elements, collect(DISTINCT id(bp)) AS bpids ORDER BY re.order
WITH bpids, a, d, rs, s, {slide: {id: id(s), properties: s}, children: collect(elements)} AS slides ORDER BY rs.order
RETURN {document: {id: id(d), properties: d, author: {name: a.name, surname: a.surname}, cited_by: bpids}, children: collect(slides)} AS item;

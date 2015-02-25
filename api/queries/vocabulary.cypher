// name: getAll
// Retrieve every vocabulary element sorted alphabetically
MATCH (v:Vocabulary {lang: {lang}})-[r:HAS]-(p:Paragraph)
OPTIONAL MATCH (v)-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH v, r, {
  id: id(p),
  properties: p
} AS paragraphs,
collect(id(bp)) AS bpids
ORDER BY r.order

RETURN {
  vocabulary: {
    id: id(v),
    properties: v,
    cited_by: bpids
  },
  children: collect(paragraphs)
} AS item
ORDER BY item.vocabulary.properties.title
SKIP {offset}
LIMIT {limit};

// name: getByIds
// Retrieve one or more vocabulary entries by id
START v=node({ids})
MATCH (v:Vocabulary)-[r:HAS]-(p:Paragraph)
OPTIONAL MATCH (v)-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH v, r, {
  id: id(p),
  properties: p
} AS paragraphs,
collect(id(bp)) AS bpids
ORDER BY r.order

RETURN {
  vocabulary: {
    id: id(v),
    properties: v,
    cited_by: bpids
  },
  children: collect(paragraphs)
};

// name: getBySlugIds
// Retrieve one or more vocabulary entries by slug_id
MATCH (v:Vocabulary)-[r:HAS]-(p:Paragraph)
WHERE v.slug_id IN {slug_ids}
OPTIONAL MATCH (v)-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH v, r, {
  id: id(p),
  properties: p
} AS paragraphs,
collect(id(bp)) AS bpids
ORDER BY r.order

RETURN {
  vocabulary: {
    id: id(v),
    properties: v,
    cited_by: bpids
  },
  children: collect(paragraphs)
};

// name: search
// Search for a precise string in a LIKE manner across vocabulary items
MATCH (v:Vocabulary)-[r:HAS]-(p:Paragraph)
WHERE (v.title =~ {query} OR p.text =~ {query}) AND v.lang = {lang}
OPTIONAL MATCH (v)-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH v, r, {
  id: id(p),
  properties: p
} AS paragraphs,
collect(id(bp)) AS bpids
ORDER BY r.order

RETURN {
  vocabulary: {
    id: id(v),
    properties: v,
    cited_by: bpids
  },
  children: collect(paragraphs)
} AS item
ORDER BY item.vocabulary.properties.title ASC;

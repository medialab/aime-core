// name: getAll
// Retrieve every document sorted alphabetically
MATCH (a:User)<-[:CREATED_BY]-(d:Document {lang: {lang}, status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
WITH e, d, a, s, rs, re, head(collect(r)) AS ref

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: ref
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(elements)
} AS slides
ORDER BY rs.order ASC

WITH d, a, collect(slides) AS aggregatedSlides
ORDER BY d.date DESC, d.title ASC
SKIP {offset}
LIMIT {limit}

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, aggregatedSlides, collect(id(bp)) AS bpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids
  },
  children: aggregatedSlides
};

// name: getBySlugIds
// Retrieve one or more document by their slug ids.
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE d.slug_id IN {slug_ids}

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
WITH e, d, a, s, rs, re, head(collect(r)) AS ref

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: ref
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(elements)
} AS slides
ORDER BY rs.order ASC

WITH d, a, collect(slides) AS aggregatedSlides
ORDER BY d.date DESC, d.title ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, aggregatedSlides, collect(id(bp)) AS bpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids
  },
  children: aggregatedSlides
} AS item;


// name: getByIds
// Retrieve one or more document by their neo4j ids.
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE id(d) IN {ids}

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
WITH e, d, a, s, rs, re, head(collect(r)) AS ref

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: ref
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(elements)
} AS slides
ORDER BY rs.order ASC

WITH d, a, collect(slides) AS aggregatedSlides
ORDER BY d.date DESC, d.title ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, aggregatedSlides, collect(id(bp)) AS bpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids
  },
  children: aggregatedSlides
} AS item

// name: getByModecross
// Retrieve every documents related to a precise mode or crossing.
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public", lang: {lang}})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
MATCH ({name: {modecross}})<-[:RELATES_TO]-(d)

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
WITH e, d, a, s, rs, re, head(collect(r)) AS ref

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: ref
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(elements)
} AS slides
ORDER BY rs.order ASC

WITH d, a, collect(slides) AS aggregatedSlides
ORDER BY d.date DESC, d.title ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, aggregatedSlides, collect(id(bp)) AS bpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids
  },
  children: aggregatedSlides
} AS item
ORDER BY item.document.properties.date DESC, item.document.properties.title ASC

// name: getForUpdate
// Retrieve the necessary information to update a specific document.
START d=node({id})
MATCH (d)-[rs:HAS]->(s:Slide)-[re:HAS]->(e)

WITH d, rs, s, {
  id: id(e),
  relId: id(re),
  properties: e
} AS elements

WITH d, {
  id: id(s),
  relId: id(rs),
  properties: s,
  children: collect(elements)
} AS slides

RETURN {
  id: id(d),
  properties: d,
  children: collect(slides)
};

// name: search
// Search for a precise string in a LIKE manner across documents
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
WITH a, d, rs, s, re, e, r
WHERE (
  d.title =~ {query} OR
  e.text =~ {query} OR
  (a.name + " " + a.surname) =~ {query} OR
  (a.surname + " " + a.name) =~ {query} OR
  (r IS NOT NULL AND r.text =~ {query})
) AND d.lang = {lang}

WITH e, d, a, s, rs, re, head(collect(r)) AS ref

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: ref
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(elements)
} AS slides
ORDER BY rs.order ASC

WITH d, a, collect(slides) AS aggregatedSlides
ORDER BY d.date DESC, d.title ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, aggregatedSlides, collect(id(bp)) AS bpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids
  },
  children: aggregatedSlides
} AS item
ORDER BY item.document.properties.title ASC;

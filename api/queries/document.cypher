// name: getAll
// Retrieve every document sorted alphabetically
MATCH (a:User)<-[:CREATED_BY]-(d:Document {lang: {lang}, status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, slides, collect(DISTINCT id(bp)) AS bpids

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
  children: collect(slides)
} AS item
ORDER BY item.document.properties.date DESC, item.document.properties.title ASC
SKIP {offset}
LIMIT {limit}

// name: getBySlugIds
// Retrieve one or more document by their slug ids.
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE d.slug_id IN {slug_ids}

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, slides, collect(DISTINCT id(bp)) AS bpids

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
  children: collect(slides)
} AS item;


// name: getByIds
// Retrieve one or more document by their neo4j ids.
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE id(d) IN {ids}

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, slides, collect(DISTINCT id(bp)) AS bpids

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
  children: collect(slides)
} AS item

// name: getByModecross
// Retrieve every documents related to a precise mode or crossing.
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public", lang: {lang}})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
MATCH ({name: {modecross}})<-[:RELATES_TO]-(d)
OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, slides, collect(DISTINCT id(bp)) AS bpids

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
  children: collect(slides)
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

WITH d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)
WITH d, a, slides, collect(DISTINCT id(bp)) AS bpids

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
  children: collect(slides)
} AS item
ORDER BY item.document.properties.title ASC;

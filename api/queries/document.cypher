// name: getAll
// Retrieve every document sorted alphabetically
MATCH (a:User)<-[:CREATED_BY]-(d:Document {lang: {lang}})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE d.status = "public" OR id(a) = {user_id} OR {is_admin}

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
      id: id(a),
      name: a.name,
      surname: a.surname,
      role: a.role
    },
    cited_by: bpids
  },
  children: aggregatedSlides
};

// name: getBySlugIds
// Retrieve one or more document by their slug ids.
MATCH (a:User)<-[:CREATED_BY]-(d:Document)-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
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

OPTIONAL MATCH (d)<-[:CITES]-(:Paragraph)<-[:HAS]-(v:Vocabulary)
WITH d, a, aggregatedSlides, bpids, collect(v.slug_id) AS vpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids,
    cited_by_voc: vpids
  },
  children: aggregatedSlides
} AS item;


// name: getByIds
// Retrieve one or more document by their neo4j ids.
MATCH (a:User)<-[:CREATED_BY]-(d:Document)-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
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

OPTIONAL MATCH (d)<-[:CITES]-(:Paragraph)<-[:HAS]-(v:Vocabulary)
WITH d, a, aggregatedSlides, bpids, collect(v.slug_id) AS vpids

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      id: id(a),
      name: a.name,
      surname: a.surname
    },
    cited_by: bpids,
    cited_by_voc: vpids
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
MATCH (a:User)<-[ra:CREATED_BY]-(d)-[rs:HAS]->(s:Slide)-[re:HAS]->(e)
OPTIONAL MATCH (e)<-[br:BOOKMARKED]-(ba:User)

WITH d, rs, s, ra, a, {
  id: id(e),
  relId: id(re),
  properties: e,
  bookmarks: filter(x IN collect({relId: id(br), userId: id(ba)}) WHERE x.relId IS NOT NULL)
} AS elements

WITH d, ra, a, {
  id: id(s),
  relId: id(rs),
  properties: s,
  children: collect(elements)
} AS slides

RETURN {
  id: id(d),
  authorId: id(a),
  authorRelId: id(ra),
  properties: d,
  children: collect(slides)
};

// name: search
// Search for a precise string in a LIKE manner across documents
MATCH (a:User)<-[:CREATED_BY]-(d:Document)-[:HAS]->(:Slide)-[:HAS]->(e)
WHERE d.status = "public" OR id(a) = {user_id}
OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
WITH a, d, e, r
WHERE (
  d.title =~ {query} OR
  e.text =~ {query} OR
  (a.name + " " + a.surname) =~ {query} OR
  (a.surname + " " + a.name) =~ {query} OR
  (r IS NOT NULL AND r.text =~ {query})
) AND d.lang = {lang}

WITH d
MATCH (a:User)<-[:CREATED_BY]-(d)-[rs:HAS]->(s:Slide)-[re:HAS]->(e)
WHERE d.status = "public" OR id(a) = {user_id}
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
ORDER BY item.document.properties.title ASC;

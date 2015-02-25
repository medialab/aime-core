// name: getAll
// Retrieve every document sorted alphabetically
MATCH (a:User)<-[:CREATED_BY]-(d:Document {lang: {lang}, status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH bp, d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH bp, d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: collect(DISTINCT id(bp))
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
OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH bp, d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH bp, d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: collect(DISTINCT id(bp))
  },
  children: collect(slides)
} AS item

// name: search
// Search for a precise string in a LIKE manner across documents
MATCH (a:User)<-[:CREATED_BY]-(d:Document {status: "public"})-[rs:HAS]-(s:Slide)-[re:HAS]-(e)
WHERE (d.title =~ {query} OR e.text =~ {query} OR (a.name + " " + a.surname) =~ {query} OR (a.surname + " " + a.name) =~ {query})
AND d.lang = {lang}

OPTIONAL MATCH (e)<-[:DESCRIBES]-(r:Reference)
OPTIONAL MATCH (d)<-[:CITES]-(bp:Paragraph)<-[:HAS]-(:Subheading)

WITH bp, d, a, s, rs, re,
{
  id: id(e),
  properties: e,
  reference: r
} AS elements
ORDER BY re.order ASC

WITH bp, d, a, rs, {
  slide: {
    id: id(s),
    properties: s
  },
  children: collect(DISTINCT elements)
} AS slides
ORDER BY rs.order ASC

RETURN {
  document: {
    id: id(d),
    properties: d,
    author: {
      name: a.name,
      surname: a.surname
    },
    cited_by: collect(DISTINCT id(bp))
  },
  children: collect(slides)
} AS item
ORDER BY item.document.properties.title ASC;

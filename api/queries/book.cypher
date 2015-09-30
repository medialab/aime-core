// name: getAll
// Retrieving the whole book and ordering it through edge data.
MATCH (b:Book {lang: {lang}})-[rc:HAS]-(c:Chapter)-[rs:HAS]-(s:Subheading)-[rp:HAS]-(p:Paragraph)

OPTIONAL MATCH (u:User)-[bookmarked:BOOKMARKED]->(p)
WHERE id(u) = {user_id}

WITH s, c, p, rs, rc, rp, {
  id: id(p),
  properties: p,
  bookmarked: coalesce(bookmarked, false)
} AS paragraphs
ORDER BY rp.order ASC

WITH c, rs, rc, {
  subheading: {
    id: id(s),
    properties: s
  },
  children: collect(paragraphs)
} AS subheadings
ORDER BY rs.order ASC

WITH rc, {
  chapter: {
    id: id(c),
    properties: c
  },
  children: collect(subheadings)
} AS chapters
ORDER BY rc.order ASC

RETURN chapters;

// name: getByModecross
// Retrieve every subheadings related to a precise mode or crossing.
MATCH (c:Chapter)-[rs:HAS]->(s:Subheading {lang: {lang}})-[rp:HAS]->(p:Paragraph)
MATCH (s)-[:RELATES_TO]->({name: {modecross}})

WITH c, s, rp, rs, {
  id: id(p),
  properties: p
} AS paragraphs
ORDER BY rp.order ASC

WITH s, {
  parent: {
    id: id(c),
    properties: c
  },
  subheading: {
    id: id(s),
    properties: s,
    index: rs.order + 1
  },
  children: collect(paragraphs)
} AS subheadings
ORDER BY s.page

RETURN subheadings;

// name: search
// Search for a precise string in a LIKE manner across book items and return their ids
MATCH (n)
WHERE
  (n:Chapter OR n:Subheading OR (:Subheading)-[:HAS]-(n:Paragraph)) AND
  n.lang = {lang} AND
  n.text =~ {query}
RETURN id(n);

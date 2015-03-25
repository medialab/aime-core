// name: getInfo
// A simple query returning an index of crossings, modes and some aggregate values about them.
MATCH (m:Mode)
OPTIONAL MATCH (m)<-[:RELATES_TO]-(tm)
WHERE tm.lang = {lang} AND (not(tm:Contribution) OR tm.status = 'public')
WITH m, collect(DISTINCT tm) AS related
WITH {
  name: m.name,
  count: length(filter(i in related WHERE i.type <> 'scenario')),
  scenars: length(filter(i in related WHERE i.type = 'scenario'))
} AS elements
RETURN collect(elements) AS result

UNION

MATCH (c:Crossing)
OPTIONAL MATCH (c)<-[:RELATES_TO]-(tc)
WHERE tc.lang = {lang} AND (not(tc:Contribution) OR tc.status = 'public')
WITH c, collect(DISTINCT tc) AS related
WITH {
  name: c.name,
  count: length(filter(i in related WHERE i.type <> 'scenario')),
  scenars: length(filter(i in related WHERE i.type = 'scenario'))
} AS elements
RETURN collect(elements) AS result;

// name: modecross
// Query returning a batch of things related to the given mode or crossing.
MATCH (m {name: {name}})<-[:DEFINES]-(v:Vocabulary {lang: {lang}})-[rp:HAS]->(p:Paragraph)
WITH m, v, rp, p ORDER BY rp.order
WITH m, v, collect(p) AS paragraphs
OPTIONAL MATCH (m)<-[:RELATES_TO]-(s:Scenario {status: 'published', lang: {lang}})-[rs:HAS]->(i)
WITH m, v, paragraphs, rs, s, i ORDER BY rs.order
WITH m, v, paragraphs, {scenario: s, items: collect(i)} AS scenars
RETURN {name: m.name, type: m.type, slug_id: v.slug_id, paragraphs: paragraphs, scenars: filter(s in collect(scenars) WHERE s.scenario IS NOT NULL)};

// name: tiles
// Returning basic information about the database objects so we can build tiles index.
MATCH (e {lang: {lang}})
WHERE e:Subheading OR e:Vocabulary OR e:Document
RETURN
	CASE WHEN has(e.name) THEN e.name ELSE e.title END AS title,
	e.type AS type;

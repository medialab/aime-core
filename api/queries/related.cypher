// name: mode
// Query returning a batch of things related to the given mode.
MATCH (m:Mode {name: {name}})<-[:DEFINES]-(:Vocabulary {lang: {lang}})-[rp:HAS]->(p:Paragraph)
WITH m, rp, p ORDER BY rp.order
WITH m, collect(p) AS paragraphs
OPTIONAL MATCH (m)<-[:RELATES_TO]-(s:Scenario {status: 'published', lang: {lang}})-[rs:HAS]->(i)
WITH m, paragraphs, rs, s, i ORDER BY rs.order
WITH m, paragraphs, {scenario: s, items: collect(i)} AS scenars
RETURN {name: m.name, paragraphs: paragraphs, scenars: filter(s in collect(scenars) WHERE s.scenario IS NOT NULL)};

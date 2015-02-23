// name: getAll
// Retrieving the whole book and ordering it through edge data.
MATCH (b:Book {lang: {lang}})-[rc:HAS]-(c:Chapter)-[rs:HAS]-(s:Subheading)-[rp:HAS]-(p:Paragraph)
WITH s, c, p, rs, rc, rp, {id: id(p), properties: p} AS paragraphs ORDER BY rp.order ASC
WITH c, rs, rc, {subheading: {id: id(s), properties: s}, children: collect(paragraphs)} AS subheadings ORDER BY rs.order ASC
WITH rc, {chapter: {id: id(c), properties: c}, children: collect(subheadings)} AS chapters ORDER BY rc.order ASC
RETURN chapters;

// name: follow
// Retrieving the whole book through BEGINS_WITH and FOLLOWS edges.
MATCH (b:Book {lang: {lang}})-[:BEGINS_WITH]-(c1:Chapter)<-[cr:FOLLOWS*0..]-(c)
MATCH (c)-[:BEGINS_WITH]-(s1:Subheading)<-[sr:FOLLOWS*0..]-(s)
MATCH (s)-[:BEGINS_WITH]-(p1:Paragraph)<-[pr:FOLLOWS*0..]-(p)
WITH c, cr, s, sr, pr, {id: id(p), properties: p} as paragraph
ORDER BY length(pr)
WITH c, {subheading: {id: id(s), properties: s}, children: collect(paragraph)} as sub, cr, sr
ORDER BY length(sr)
WITH {chapter: {id: id(c), properties: c}, children: collect(sub)} as chapter, cr
ORDER BY length(cr)
RETURN chapter;

// name: search
// Search for a precise string in a LIKE manner across book items and return their ids
MATCH (n)
WHERE
  (n:Chapter OR n:Subheading OR (:Subheading)-[:HAS]-(n:Paragraph)) AND
  n.text =~ {query}
RETURN id(n);

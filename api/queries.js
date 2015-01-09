/**
 * AIME-core Queries
 * ==================
 *
 * Collection of queries aiming at retrieving desired data in the neo4j
 * database.
 */

// List of cypher queries
module.exports = {

  /**
   * Retrieving the whole book.
   */
  book: [
    'MATCH (b:Book {lang: {lang}})-[rc:HAS]-(c:Chapter)-[rs:HAS]-(s:Subheading)-[rp:HAS]-(p:Paragraph)',
    'WITH s, c, p, rs, rc, rp, {id: id(p), properties: p} AS paragraphs ORDER BY rp.order ASC',
    'WITH c, rs, rc, {subheading: {id: id(s), properties: s}, paragraphs: collect(paragraphs)} AS subheadings ORDER BY rs.order ASC',
    'WITH rc, {chapter: {id: id(c), properties: c}, subheadings: collect(subheadings)} AS chapters ORDER BY rc.order ASC',
    'RETURN chapters;'
  ].join('\n'),

  /**
   * Alternate version of book retrieval
   */
  follow: [
    'MATCH (b:Book {lang: {lang}})-[:BEGINS_WITH]-(c1:Chapter)<-[cr:FOLLOWS*0..]-(c)',
    'MATCH (c)-[:BEGINS_WITH]-(s1:Subheading)<-[sr:FOLLOWS*0..]-(s)',
    'MATCH (s)-[:BEGINS_WITH]-(p1:Paragraph)<-[pr:FOLLOWS*0..]-(p)',
    'WITH c, cr, s, sr, pr, {id: id(p), properties: p} as paragraph',
    'ORDER BY length(pr)',
    'WITH c, {subheading: {id: id(s), properties: s}, paragraphs: collect(paragraph)} as sub, cr, sr',
    'ORDER BY length(sr)',
    'WITH {chapter: {id: id(c), properties: c}, subheadings: collect(sub)} as chapter, cr',
    'ORDER BY length(cr)',
    'RETURN chapter'
  ].join('\n')
};


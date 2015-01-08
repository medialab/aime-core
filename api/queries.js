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
  ].join('\n')
};

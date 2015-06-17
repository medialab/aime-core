// name: getAll
// Retrieving all the media resources stored in the database.
MATCH (m:Media)
WHERE not((m)-[:AVATAR_OF]->(:User))

OPTIONAL MATCH (m)<-[:DESCRIBES]-(r:Reference)

WITH m, head(collect(r)) AS ref

RETURN {
  id: id(m),
  properties: m,
  reference: ref
} AS resource

ORDER BY resource.properties.kind;

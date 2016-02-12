// name: getAll
// Retrieving all the media resources stored in the database.
MATCH (m:Media)
WHERE not((m)-[:AVATAR_OF]->(:User))

OPTIONAL MATCH (m)<-[:DESCRIBES]-(r:Reference)

WITH m, head(collect(r)) AS ref

RETURN {
  id: id(m),
  properties: m,
  reference: {
    id: id(ref),
    properties: ref
  }
} AS resource

ORDER BY resource.properties.kind;

// name: getByIds
// Retrieve one or more document by their neo4j ids.
START m=node({ids})
OPTIONAL MATCH (m)<-[:DESCRIBES]-(r:Reference)

WITH m, head(collect(r)) AS ref

RETURN {
  id: id(m),
  properties: m,
  reference: ref
} AS resource;

// name: getReferenceByBiblibId
// Retrieve a single reference by biblib id.
MATCH (r:Reference {biblib_id: {id}})
RETURN r LIMIT 1;
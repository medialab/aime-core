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
// Retrieve one or more resources by their neo4j ids.
START m=node({ids})
OPTIONAL MATCH (m)<-[:DESCRIBES]-(r:Reference)

WITH m, head(collect(r)) AS ref

RETURN {
  id: id(m),
  properties: m,
  reference: {
    id: id(ref),
    properties: ref
  }
} AS resource;

// name: getForUpdate
// Retrieve a single resource for update purposes.
START media=node({id})
OPTIONAL MATCH (media)<-[r:DESCRIBES]-(reference:Reference)
RETURN media, reference.biblib_id AS referenceId, id(r) AS relationId LIMIT 1;

// name: getReferenceByBiblibId
// Retrieve a single reference by biblib id.
MATCH (r:Reference {biblib_id: {id}})
RETURN r LIMIT 1;

// name: getParentDocumentIds
// Retrieve document ids which contains a resource
MATCH (r:Media)<-[:HAS]-(:Slide)<-[:HAS]-(d:Document)
WHERE id(r) = {id}
RETURN collect(id(d)) as documentIds
// name: getAll
// Retrieving all the media resources stored in the database.
MATCH (m:Media)
WHERE not((m)-[:AVATAR_OF]->(:User))

OPTIONAL MATCH (m)<-[:DESCRIBES]-(r:Reference)

RETURN {
	id: id(m),
	properties: m,
	reference: r
}

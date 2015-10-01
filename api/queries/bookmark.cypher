// name: create
START user=node({user_id}), target=node({target_id})
CREATE UNIQUE (user)-[:BOOKMARKED]->(target);

// name: destroy
START user=node({user_id}), target=node({target_id})
MATCH (user)-[r:BOOKMARKED]->(target)
DELETE r;

// name: get
START user=node({user_id})
MATCH (user)-[:BOOKMARKED]->(target)
RETURN id(target) AS target;

// name: getByModels
START user=node({user_id})

OPTIONAL MATCH (user)-[:BOOKMARKED]->(b:BookItem)
WITH user, collect(id(b)) AS book

OPTIONAL MATCH (user)-[:BOOKMARKED]->(vp:Paragraph)<-[:HAS]-(:Vocabulary)
WITH user, book, collect(id(vp)) AS voc

OPTIONAL MATCH (user)-[:BOOKMARKED]->(dp:Paragraph)<-[:HAS]-(:Slide)<-[:HAS]-(:Document)
RETURN book, voc, collect(id(dp)) AS doc;

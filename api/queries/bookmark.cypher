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

OPTIONAL MATCH (user)-[:BOOKMARKED]->()<-[:HAS]-(v:Vocabulary)
WITH user, book, collect(v.slug_id) AS voc

OPTIONAL MATCH (user)-[:BOOKMARKED]->()<-[:HAS]-(:Slide)<-[:HAS]-(d:Document)
RETURN book, voc, collect(d.slug_id) AS doc;

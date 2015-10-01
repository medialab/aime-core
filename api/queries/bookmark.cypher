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

// name: create
START user=node({user_id}), target=node({target_id})
CREATE (user)-[:BOOKMARKED]->(target);

// name: destroy
START user=node({user_id}), target=node({target_id})
DELETE (user)-[:BOOKMARKED]->(target);

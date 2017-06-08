// name: get
START paragraph=node({idFrom}), target=node({idTo})
OPTIONAL MATCH (paragraph)-[link:CITES]->(target)
RETURN paragraph, link, target;

// name: destroy
START paragraph=node({idFrom}), target=node({idTo})
MATCH (paragraph)-[r:CITES]->(target)
DELETE r;

// name: create
START paragraph=node({idFrom}), target=node({idTo})
MERGE (paragraph)-[:CITES]->(target);
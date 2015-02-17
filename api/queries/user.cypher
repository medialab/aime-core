// name: login
// Attempt to log a user through an email and a password hash
MATCH (n:User {email: {email}, password: {hash}, active: {active}}) RETURN n;

// name: create
// Creates a single user and returns it
CREATE (n:User {properties})
RETURN n;

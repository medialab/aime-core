// name: login
// Attempt to log a user through an email and a password hash
MATCH (u:User {email: {email}, password: {hash}, active: {active}}) RETURN u;

// name: create
// Creates a single user and returns it
CREATE (u:User {properties})
RETURN u;

// name: activate
// Activate a single user by token
MATCH (u:User {token: {token}})
SET u.active = true
REMOVE u.token
RETURN u;

// name: update
// Update a single user
MATCH (u:User)
WHERE id(u) = {id}
SET u += {properties}
RETURN u;

// name: exportNewUsers
MATCH (u:User)
WHERE not(has(u.date))
RETURN
  u.type AS type,
  u.email AS email,
  coalesce(u.username, "") AS username,
  u.password AS password,
  u.active AS active,
  u.name AS name,
  u.surname AS surname,
  coalesce(u.profile, "") AS profile,
  u.role AS role,
  coalesce(u.institution, "") AS institution,
  coalesce(u.department, "") AS department,
  coalesce(u.interests, "") AS interests,
  coalesce(u.keywords, "") AS keywords;

// name: importNewUsers
LOAD CSV WITH HEADERS FROM {path} AS line
CREATE (u:User)
SET u = line
SET u.date = 20151019
RETURN u;

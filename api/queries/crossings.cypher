// name: getInfo
// A simple query returning an index of crossings, modes and some aggregate values about them.
MATCH (m:Mode)
OPTIONAL MATCH (m)<-[:RELATES_TO]-(tm)
WHERE tm.lang = {lang} AND (not(tm:Contribution) OR tm.status = 'public')
WITH m, collect(DISTINCT tm) AS related
WITH {
  name: m.name,
  count: length(filter(i in related WHERE i.type <> 'scenario')),
  scenars: length(filter(i in related WHERE i.type = 'scenario'))
} AS elements
RETURN collect(elements) AS result

UNION

MATCH (c:Crossing)
OPTIONAL MATCH (c)<-[:RELATES_TO]-(tc)
WHERE tc.lang = {lang} AND (not(tc:Contribution) OR tc.status = 'public')
WITH c, collect(DISTINCT tc) AS related
WITH {
  name: c.name,
  count: length(filter(i in related WHERE i.type <> 'scenario')),
  scenars: length(filter(i in related WHERE i.type = 'scenario'))
} AS elements
RETURN collect(elements) AS result;

// name: biblibId
// turn biblib id to strings
MATCH (r:Reference) WHERE HAS(r.biblib_id) SET r.biblib_id = "" + r.biblib_id

// name: rmDuplicateDescribes
// remove duplicate describes links between references and medias
MATCH (:Reference)-[r:DESCRIBES]->(m:Media)
WITH m, tail(collect(r)) as links
FOREACH(link in links | DELETE link)

// name: lastupdateLegacy
// archive last_update field to legacy and fill it with current date
MATCH (d) WHERE HAS(d.last_update)
SET d.last_update_legacy = COALESCE(d.last_update_legacy, d.last_update)
SET d.last_update = COALESCE(d.last_update, {timestamp})

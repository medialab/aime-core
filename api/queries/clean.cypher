// name: biblibId
// Turn biblib id to strings
MATCH (r:Reference) WHERE has(r.biblib_id) SET r.biblib_id = "" + r.biblib_id

// name: rmDuplicateDescribes
// Remove duplicate describes links between references and medias
MATCH (:Reference)-[r:DESCRIBES]->(m:Media)
WITH m, tail(collect(r)) as links
FOREACH(link in links | DELETE link)

// name: lastupdateLegacy
// Archive last_update field to legacy and fill it with current date
MATCH (d) WHERE has(d.last_update)
SET d.last_update_legacy = coalesce(d.last_update_legacy, d.last_update)
SET d.last_update = coalesce(d.last_update, {timestamp})

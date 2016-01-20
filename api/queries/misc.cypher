// name: getMaximumSlugIds
MATCH (v:Vocabulary)
RETURN max(v.slug_id) AS max

UNION
MATCH (d:Document)
RETURN max(d.slug_id) AS max

UNION
MATCH (m:Media)
RETURN max(m.slug_id) AS max

UNION
MATCH (r:Reference)
RETURN max(r.slug_id) AS max;

// name: getMediasAndReferences
MATCH (m:Media)
WHERE m.slug_id IN {res_ids}
RETURN m AS nodes

UNION
MATCH (r:Reference)
WHERE r.slug_id IN {ref_ids}
RETURN r AS nodes

// name: exists
MATCH (d {type: {type}})
WHERE d.slug_id = {slug_id}
RETURN d LIMIT 1;

// name: bookExists
MATCH (n)
WHERE id(n) = {id} AND (n:Chapter OR n:Subheading)
OPTIONAL MATCH (c:Chapter)-[:HAS]->(n)
RETURN n AS element, c AS chapter LIMIT 1;

// name: legacyExists
MATCH (n {legacy_id: {id}, lang: {lang}})
OPTIONAL MATCH (c:Chapter)-[:HAS]->(n)
RETURN n AS element, c AS chapter LIMIT 1;

// name: getModecross
MATCH (modecross)
WHERE
  (modecross:Mode OR modecross:Crossing) AND
  modecross.name = {modecross}
RETURN modecross LIMIT 1;

// name: getModecrossVoc
MATCH (modecross)<-[:DEFINES]-(v:Vocabulary)
WHERE
  (modecross:Mode OR modecross:Crossing) AND
  modecross.name = {modecross} AND
  v.lang = {lang}
RETURN v LIMIT 1;

// name: stats
MATCH (d:Document {status: 'public', original: false})-[:CREATED_BY]->(u:User)
WHERE u.email <> 'modesofexistence@gmail.com'
RETURN d AS document, d.slug_id AS document_id, u AS user
ORDER BY u.surname;

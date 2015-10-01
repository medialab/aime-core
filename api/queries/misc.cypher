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

// name: getModecrossVoc
MATCH (v:Vocabulary {title: {modecross}, lang: {lang}})
RETURN v LIMIT 1;

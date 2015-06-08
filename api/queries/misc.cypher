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

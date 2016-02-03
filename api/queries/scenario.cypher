// name: getItems
// Query returning items real ids by label and slugs.
MATCH (s:Subheading)
WHERE s.slug_id IN {bsc}
RETURN id(s) AS id

UNION ALL

MATCH (v:Vocabulary)
WHERE v.slug_id IN {voc}
RETURN id(v) AS id

UNION ALL

MATCH (d:Document)
WHERE d.slug_id IN {doc}
RETURN id(d) AS id

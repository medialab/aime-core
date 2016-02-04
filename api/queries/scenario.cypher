// name: getItems
// Query returning items real ids by label and slugs.
MATCH (s:Subheading)
WHERE s.slug_id IN {bsc}
RETURN
  id(s) AS id,
  "bsc_" + s.slug_id AS slug_id

UNION ALL

MATCH (v:Vocabulary)
WHERE v.slug_id IN {voc}
RETURN
  id(v) AS id,
  "voc_" + v.slug_id AS slug_id

UNION ALL

MATCH (d:Document)
WHERE d.slug_id IN {doc}
RETURN
  id(d) AS id,
  CASE d:Contribution
    WHEN true THEN "cont_" + d.slug_id
    ELSE "doc_" + d.slug_id
  END AS slug_id;

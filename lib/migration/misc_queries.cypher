// Retrieving the useless one slide/one reference documents
MATCH (d:Document)-[e1]-(s:Slide)-[e2]-(r)
WITH d,e1,s,e2,r,count(e1) AS nb_slides, count(e2) AS nb_entities
WHERE d.original AND nb_slides = 1 AND nb_entities = 1 AND r:Reference
RETURN d,e1,s,e2,r;

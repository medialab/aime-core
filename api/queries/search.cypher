// name: searchAllModels
// Search for a precise string in a LIKE manner across every model of the database
MATCH (n)
WHERE
  (n:Chapter OR n:Subheading OR (:Subheading)-[:HAS]-(n:Paragraph)) AND
  n.markdown =~ {query}
RETURN id(n);

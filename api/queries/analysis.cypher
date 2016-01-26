// 10,1,5

// name: findDuplicates
MATCH (d:Document {original: true})-[rs:HAS]->(:Slide)-[ri:HAS]->(i:Reference)
WHERE not(d:Contribution) AND d.title =~ "(?i).*\\d{4}.*"
WITH d, ri, count(rs) AS nbs
WHERE nbs = 1
WITH d, count(ri) AS nbi
WHERE nbi = 1
MATCH (d)-[rs:HAS]->(s:Slide)-[ri:HAS]->(i:Reference)
RETURN d, rs, s, ri, i;

# Database Documentation
WIP

## Virtual Entities

* Resource = Media + Ref || Lone Ref

## Predicates

* (Media)-[:AVATAR_OF]->(User)
* (Book)-[:BEGINS_WITH]->(Chapter)
* (Paragraph)-[:CITES]->(Document/Vocabulary/Mode/Crossing)
* (Scenario)-[CREATED_BY]->(User)
* (Reference)-[DESCRIBES]->(Media)
* (Chapter)-[:FOLLOWS]->(Chapter)
* (Chapter)-[:HAS]->(Subheading)
* (Subheading/Document/Vocabulary)-[:RELATES_TO]->(Mode/Crossing)
* (Paragraph)-[:TRANSLATES]->(Paragraph)
* (User)-[:BOOKMARKED]->(Paragraph)

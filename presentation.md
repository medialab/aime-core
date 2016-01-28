## Modeling a Philosophical Inquiry: from MySQL to a graph database
*The short story of a long refactoring process*

===

## An Inquiry into Modes of Existence
An phylosophical inquiry to...

===

## A paper book
![a book](img/aime_book.png)
===

<!-- .slide: data-background="img/aime_screencast.gif" data-background-size="1024px" -->

===

## Data model of the inquiry

===

## MySQL & graphs

How do we store a complex tree within MySQL tables?

===

## Multiplication of databases

So, before refactoring, we had:

===

### A MySQL Database

For storing a graph, remember...

===

### A Solr index (based on Lucene)

For full-text searching.

===

### A MongoDB

For a second view on already existing data.

===

### Another MongoDB

For textual references etc.

===

### A SQLite Databse

For the blog's data.

===

### A Microsoft Access Database

Just kidding... (At least not on this project)

===
<!-- .slide: data-background="img/project.png" data-background-size="1000px" -->

===

<!-- .slide: data-background="img/kill.png" data-background-size="1000px" -->
===

## The long trip towards Neo4j

* Heiko
* Heikki
* Dor
* Yomgui

Note: pom, where?

===

## Towards a single database

Now we only have one **Neo4j** instance (mostly...) holding the whole inquiry's data.

===

<!-- .slide: data-background="img/migration.png" -->

<h2 class="shadowed-title">Several thousands lines of code later...</h2>


===

## Introducing Neo4j

===

## Migrating

REFACTO la suite: 1 ordered links 2 how to map followed

intéret de la viz dans le travail de migration

===

## On the subject of ordered links

* `[:FOLLOWS]` relationships
* Relationships attributes

Note: develop

===

## refacto du cliebt 4 vers 3 colonnes

la stack cliente, la décroissance, la performance

comparaison du temps de chargement des deux versions (ancienne version dipo en interne)
arf c'est pas beaucoup plus rapide à part le chargement.

===

## Visual network analysis

1. Graph is the very epitome of complexity.

2. Humans handle complexity very badly.

3. Dataviz to the rescue.

===

## [Agent Smith](https://github.com/Yomguithereal/agent-smith)

POC tool designed to visualize *large* graphs resulting from Cypher queries.

Objective: be able to apply graph visual network analysis to Neo4j databases.

Obviously a Matrix pun.

===

<!-- .slide: data-background="img/duplicates.png" -->

```cypher
MATCH (d:Document {original: true})-[rs:HAS]->(:Slide)-[ri:HAS]->(i:Reference)
WHERE not(d:Contribution) AND d.title =~ "(?i).*\\d{4}.*"
WITH d, ri, count(rs) AS nbs
WHERE nbs = 1
WITH d, count(ri) AS nbi
WHERE nbi = 1
MATCH (d)-[rs:HAS]->(s:Slide)-[ri:HAS]->(i:Reference)
RETURN d, rs, s, ri, i;
```

===

<!-- .slide: data-background="img/balloons.png" -->

```cypher
MATCH (n:`Mode`) WITH n LIMIT 100 MATCH (n)-[r]-(t) RETURN n,r,t;
```

===

<!-- .slide: data-background="img/issue.png" -->

===

<!-- .slide: data-background="img/fixed.png" -->

===

## Remarks

When designing this tool, the Neo4j admin tool did not have the good UX it has now.

This is a complementary tool to Neo4j admin.

It remains merely a POC so try it at your own risk.

===

## From philosophy to history: a slightly different use-case


1. *find the connections* between people, pictures, letters and official documents dealing with the *European Integration process*

1. Integrate graph databases and graph visualizations in the existing workflow and research practices.




===

## First chance to see: collecting the co-occurrences

---


Display with **agent-smith** the result of automatic disambiguation on text documents with **[yago-aida](link)**

---

  (image)

---

Recognize with the researchers *other kind of relationships*, visually, and add them easily:

---

  (image)

---

Towards a *better understanding* of what a **relationships** means




===

## Can graph visualizations become entry points for (fast) data curation?

1. asymmetries and errors during the analysis process

1. easily spot *well placed* false positives

1. fulltext lucene search




===

## Can Graphs visualization serve as entry points for humanitites researchers to better structure data?

Graphs as bridges / obstacles between a designer and the researchers needs



===

## Graphs vis reveal the (ductile) structure of the data

There is no difference/distance between the **represented** structure and the **db** structure

Finally, we can opened up the database *creation* process


===

## Graphs are tools

shift towards idea of *networks as constructs*, merely built-up representation;

Graphs should not be the **final-chance-to-see**


===

## Neo4j Feedback

simplify plugins installation (for designers ...?): something like a package manager



===

## Neo4j Feedback

(probably more slides)

* Cypher as the main selling point
* Maintenance difficulties concerning the community edition




===

## Back to the future

Quinoa / Dolman / Decypher etc.

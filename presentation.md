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

[Neo4j](http://neo4j.com/) is a graph database.

Which means that instead of storing tables or documents etc. you store an actual graph.

So, knowing the ultra-relational nature of our data, this seems like a good fit.

===

## Migrating

So how do we go from the data model we saw precedently to one that could better fit a Neo4j database?

===

<!-- .slide: data-background="img/neo4j-schema.png" data-background-size="1000px" -->

===

## Problems & choices to be made

1. How do we handle ordered series of links?

2. Are some of our legacy data model's idiosyncrasies now obsolete and harmful to the new one?

===

## On the subject of ordered links

1. Chapters have sub-chapters and sub-chapters have paragraphs.

2. You will probably agree that in this case, order is quite important...

3. How do we do so within a graph structure?

===

## Solution n°1 - continuation relationships

```cypher
MATCH (:Chapter)-[:STARTS_WITH]->(:SubChapter)-[:NEXT*1..]->(:SubChapter)
```

**Advantages**: feels natural, write is often more performant than with solution n°2 (spoiler!)

**Drawbacks**: quite slow to read and to recompose, need to use unbound `[:NEXT*1..]`.

===

## Solution n°2 - relationship properties

```cypher
MATCH (c:Chapter)-[r:HAS]->(s:SubChapter)
WITH r, {
  chapter: c,
  subchapters: collect(s)
} AS chapter
ORDER BY r.order
RETURN chapter
```

**Advantages**: easy to read and to compute.

**Drawbacks**: might get costly to write depending on where you add a new element.

===

## Other solutions?

Some people maintain that storing ordered list in a graph is sort of a heresy.

===

## Are the documents' slides obsolete?

```cypher
MATCH (:Document)-[:HAS]->(:Slide)-[:HAS]->(:Element)
```

1. Should the slide node become an element?

2. Is this an artifact from both the initial design & data model?

3. Should the document contains its display as whole markdown and keep links to meaningful elements for query purposes?

===

## Monitoring the migration

What one wants to avoid when migrating data from one model to another is obviously to:

* do it comfortably
* ensure that no data is lost or corrupted during the process

We therefore need the proper tools.

===

## On the legacy side

1. Monitoring MySQL & MongoDB is quite easy and the tools are good and numerous.

2. Trusty PHPMyAdmin & Robomongo.

3. Monitoring a graph databse is another problem altogether.

===

## Neo4j admin

1. Neo4j is a good tool with good UX.

2. Very handy to profile & explain queries as well as understanding how they work and what they return.

3. Can give a fine sense of the local geography of a node or of a small group of nodes.

===

## But...

1. Cannot display large graphs.

2. Only has a basic spring layout.

3. We cannot use *visual network analysis* on our data.

===

## [Visual network analysis](http://www.medialab.sciences-po.fr/fr/publications/visual-network-analysis/)

1. Graph is the very epitome of complexity.

2. Humans handle complexity very badly.

3. Dataviz to the rescue.

===

## [Agent Smith](https://github.com/Yomguithereal/agent-smith)

POC tool designed to visualize *large* graphs resulting from Cypher queries so we can ensure the data migration was going according to plan.

Aims at being a complementary tool to the Neo4j admin.

Obviously a Matrix pun.

===

## Rendering

1. SVG is very useful if you need to easily customize your visualization.

2. It is very less so when you need performance.

3. Let's try using canvas & WebGL to display our graph (using [sigma.js](http://sigmajs.org/)).

===

## Layout

1. D3's spring layout is more cosmetic than "accurate".

2. Its goal is to ensure a naive anti-collision and an even visual repartition, not layout quality.

3. Let's use [ForceAtlas 2](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679) to give more meaning to our graph' geography.

===

## Use cases

But this remains a bit blurry.

Let's check two different use cases to see how visual network analysis can help us spot inconsistencies in our data.

===

<!-- .slide: data-background="img/duplicates.png" -->

```cypher
// Finding duplicates

MATCH (d:Document {original: true})-[rs:HAS]->(:Slide)-[ri:HAS]->(i:Reference)
WHERE not(d:Contribution) AND d.title =~ "(?i).*\\d{4}.*"
WITH d, ri, count(rs) AS nbs
WHERE nbs = 1
WITH d, count(ri) AS nbi
WHERE nbi = 1
MATCH (d)-[rs:HAS]->(s:Slide)-[ri:HAS]->(i:Reference)
RETURN d, rs, s, ri, i;
```

Note: convoluted query

===

<!-- .slide: data-background="img/balloons.png" -->

```cypher
// Finding errors in link generation

MATCH (n:`Mode`) WITH n LIMIT 100 MATCH (n)-[r]-(t) RETURN n,r,t;
```

===

<!-- .slide: data-background="img/issue.png" -->

===

<!-- .slide: data-background="img/fixed.png" -->

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

1. Cypher is clearly the main selling point.

2. Output constraints sometimes.

3. Lack of maintenance tools with the community edition.

Note: huge work done on the output, contrary to SQL. Shame it's not complete :)

===

## Neo4j Feedback

* simplify plugins installation (for designers ...?): something like a package manager

Note: dani refine


===

## Back to the future

1. [decypher](https://github.com/Yomguithereal/decypher#readme), a handful of node.js utilities to handle cypher queries.

2. Quinoa editor.

3. TOFLIT18 & its scalability issues.

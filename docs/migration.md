# Migration Notes

This document is an attempt to describe the migration process needed to be run whenever wanting to put the latest book's editions into production.

It does not discuss, however, the process followed to transform the multi-database from earlier codebase to the new unified Neo4j one.

## What's to be transferred from pre-prod to prod?

* New resources (data & files if any)
* Updated resources
* New documents
* Updated documents

## Process

Order is important. New resources should be handled first as following steps depend on them.

### New resources & updated resources

Migrating the new & updated resources should be done the same way as the documents (see below).

The only different thing is that one has to also copy the new files into the prod architecture if the resources' bank is not shared between pre-prod and prod.

### New documents

They can be found by testing which slug ids are absent from the prod database.

```
Set{slug ids of docs in pre-prod db} - Set{slug ids of docs in prod db}`.
```

One then need to use the `create` model function found in `api/model/document` to insert them into the prod database.

This must be done in slug id order so the prod slug id is correctly replicated (else we won't be able to make update in the future).

### Updated documents

They can be found by querying the document nodes' `last_update` field in the Neo4j database.

One then need to use the `update` model function found in `api/model/document` to update them in the prod database.

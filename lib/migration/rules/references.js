/**
 * AIME-core migration references rule
 * ====================================
 *
 * Rules concerning the linking of references and quotes to what they are
 * pointing at.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(neo4j) {
  return function (topNext) {

    async.waterfall([
      function fetchDocuments(next) {
        neo4j.db.query('MATCH (d:Document {original: true})-[:HAS]->(n:Slide)-[r:HAS]->(e) RETURN n,r,e ORDER BY r.order;', next);
      },
      function reorganizeDocumentsReferences(entities, next) {

        var batch = neo4j.db.batch();

        // Processing slides
        _(entities)
          .map(function(entity) {
            return {
              slideId: entity.n.id,
              slide: entity.n,
              entity: entity.e,
              edge: entity.r
            };
          })
          .groupBy('slideId')
          .forEach(function(slideElements) {

            var shouldReorder = false;
            slideElements.forEach(function(o, i) {
              var element = o.entity;

              // If element has no predecessor, then it is a lone reference
              var last = (slideElements[i - 1] || {}).entity;

              // TODO: if two stacked references, what should we do?
              // 1. Lone reference?
              // 2. Both references hit the same thing?
              if (last && last.type !== 'reference' && last.type !== 'paragraph' && element.type === 'reference') {

                // Linking reference to its media
                batch.relate(element, 'DESCRIBES', last);

                // Then we delete the edge and we reorder the slides edges
                batch.rel.delete(o.edge);

                o.kick = true;
                shouldReorder = true;
              }
            });

            // Reordering edges if needed
            shouldReorder && _(slideElements)
              .filter(function(o) {
                return !o.kick;
              })
              .forEach(function(o, i) {
                o.edge.order = i;
                batch.rel.update(o.edge);
              }).value();
          }).value();

        console.log('Computing document references...');
        batch.commit(next);
      },
      function fetchContributions(results, next) {
        neo4j.db.query('MATCH (d:Document {original: false})-[:HAS]->(n:Slide)-[r:HAS]->(e) RETURN n,r,e ORDER BY r.order;', next);
      },
      function reorganizeContributionsReferences(entities, next) {

        var batch = neo4j.db.batch();

        // Processing slides
        _(entities)
          .map(function(entity) {
            return {
              slideId: entity.n.id,
              slide: entity.n,
              entity: entity.e,
              edge: entity.r
            };
          })
          .groupBy('slideId')
          .forEach(function(slideElements) {

            // For the contributions, the logic is in fact reversed

            var shouldReorder = false;

            var media = _.find(slideElements, {entity: {type: 'media'}}),
                ref = _.find(slideElements, {entity: {type: 'reference'}});

            if (media && ref) {

              // Linking reference to media
              batch.relate(ref.entity, 'DESCRIBES', media.entity);
              batch.rel.delete(ref.edge);

              ref.kick = true;
              shouldReorder = true;
            }

            // Reordering edges if needed
            shouldReorder && _(slideElements)
              .filter(function(o) {
                return !o.kick;
              })
              .forEach(function(o, i) {
                o.edge.order = i;
                batch.rel.update(o.edge);
              }).value();
          }).value();

        console.log('Computing contribution references...');
        batch.commit(next);
      }
    ], topNext);
  }
};

'use strict';

/**
 * @param {mongodb.Collection} collection
 * @returns {DefinitionProvider}
 */

function mongoProviderFactory(collection) {
    return function () {
        return collection.find({ type: 'features' }).toArray().then(function (docs) {

            if (!docs.length) {
                return null;
            }

            var definitions = {};
            docs.forEach(function (doc) {
                definitions[doc._id] = doc.definitions;
            });

            return definitions;
        });
    };
}

module.exports = mongoProviderFactory;
'use strict';

/**
 * @param {mongodb.Collection} collection
 * @param documentId
 * @returns {DefinitionProvider}
 */

function mongoProviderFactory(collection) {
    var documentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'features';


    var query = { _id: documentId };

    return function (previous) {

        if (previous) {
            return collection.update(query, previous, { upsert: true }).then(function () {
                return previous;
            });
        }

        return collection.find(query).limit(1).toArray().then(function (docs) {
            var definitions = docs[0];
            if (!definitions) {
                return null;
            }
            delete definitions._id;
            return definitions;
        });
    };
}

module.exports = mongoProviderFactory;
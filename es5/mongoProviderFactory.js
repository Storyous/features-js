'use strict';

var defaultDocumentId = require('./defaultDocumentId');

/**
 * @param {mongodb.Collection} collection
 * @param documentId
 * @returns {DefinitionProvider}
 */
function mongoProviderFactory(collection) {
    var documentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultDocumentId;


    var query = { _id: documentId };

    return function () {
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
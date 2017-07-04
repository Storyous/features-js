'use strict';

const defaultDocumentId = require('./defaultDocumentId');

/**
 * @param {mongodb.Collection} collection
 * @param documentId
 * @returns {DefinitionProvider}
 */
function mongoProviderFactory(collection) {
    let documentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultDocumentId;


    const query = { _id: documentId };

    return () => collection.find(query).limit(1).toArray().then(docs => {
        const definitions = docs[0];
        if (!definitions) {
            return null;
        }
        delete definitions._id;
        return definitions;
    });
}

module.exports = mongoProviderFactory;
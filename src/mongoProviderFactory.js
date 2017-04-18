'use strict';

/**
 * @param {mongodb.Collection} collection
 * @param documentId
 * @returns {DefinitionProvider}
 */
function mongoProviderFactory (collection, documentId = 'features') {

    const query = { _id: documentId };

    return (previous) => {

        if (previous) {
            return collection.update(query, previous, { upsert: true })
                .then(() => previous);
        }

        return collection.find(query).limit(1).toArray()
            .then((docs) => {
                const definitions = docs[0];
                if (!definitions) {
                    return null;
                }
                delete definitions._id;
                return definitions;
            });
    };
}

module.exports = mongoProviderFactory;

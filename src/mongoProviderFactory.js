'use strict';

/**
 * @param {mongodb.Collection} collection
 * @returns {DefinitionProvider}
 */
function mongoProviderFactory (collection) {
    return () => collection.find({ type: 'features' })
        .toArray()
        .then((docs) => {

            if (!docs.length) {
                return null;
            }

            const definitions = {};
            docs.forEach((doc) => {
                definitions[doc._id] = doc.definitions;
            });

            return definitions;
        });
}

module.exports = mongoProviderFactory;

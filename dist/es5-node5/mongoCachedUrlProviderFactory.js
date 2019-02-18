'use strict';

const fetchUrl = require('./fetchUrl');

/**
 * @param fetch
 * @param {Collection} collection
 * @param {{
 *     cacheLifeTime?: number
 *     onError?: Function
 *     fetchOptions?: Object
 * }} options
 * @returns {Function}
 */
function mongoCachedUrlProviderFactory(fetch, collection) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


    const cacheLifetime = options.cacheLifeTime || 5 * 60 * 1000;

    return async url => {

        const documentMatcher = { _id: url, type: 'featuresByUrl' };

        let currentDefinitions = await collection.findOne(documentMatcher);

        const cacheLimitDate = new Date(Date.now() - cacheLifetime);

        if (!currentDefinitions || currentDefinitions.loadedAt < cacheLimitDate) {

            try {
                const result = await fetchUrl(fetch, url, options.fetchOptions);
                currentDefinitions = Object.assign({}, {
                    loadedAt: new Date(),
                    definitions: result
                }, documentMatcher);
                await collection.replaceOne(documentMatcher, currentDefinitions, { upsert: true });
            } catch (err) {
                if (options.onError) {
                    options.onError(err);
                }
            }
        }

        if (!currentDefinitions) {
            return null;
        }

        return currentDefinitions.definitions;
    };
}

module.exports = mongoCachedUrlProviderFactory;
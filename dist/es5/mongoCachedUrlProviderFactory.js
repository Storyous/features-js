'use strict';

var fetchUrl = require('./fetchUrl');

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
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


    var cacheLifetime = options.cacheLifeTime || 5 * 60 * 1000;

    return async function (url) {

        var documentMatcher = { _id: url, type: 'featuresByUrl' };

        var currentDefinitions = await collection.findOne(documentMatcher);

        var cacheLimitDate = new Date(Date.now() - cacheLifetime);

        if (!currentDefinitions || currentDefinitions.loadedAt < cacheLimitDate) {

            try {
                var result = await fetchUrl(fetch, url, options.fetchOptions);
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
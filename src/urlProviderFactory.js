'use strict';


const fetchUrl = require('./fetchUrl');

/**
 * @param {Function} fetch - fetch API compatible function
 * @param {string} source
 * @param {Object} [fetchOptions={}]
 * @returns {Promise.<DefinitionProvider>}
 */
function urlProviderFactory (fetch, source, fetchOptions = {}) {

    let urlProvider = source;
    if (typeof source === 'string') {
        urlProvider = () => source;
    }

    /**
     * @param {Function} [callback]
     */
    return (progressCallback) => {
        const deferredUrls = urlProvider();
        return Promise.resolve(deferredUrls)
            .then((oneOrMoreUrls) => {

                if (typeof oneOrMoreUrls === 'object') {
                    const result = {
                        null: {}
                    };
                    return Object.keys(oneOrMoreUrls).reduce((prev, key) => prev.then(() => {
                        const url = oneOrMoreUrls[key];
                        return fetchUrl(fetch, url, fetchOptions).then((urlResult) => {
                            result[key] = urlResult;
                            if (progressCallback) {
                                progressCallback();
                            }
                        });
                    }), Promise.resolve()).then(() => result);

                } else if (typeof oneOrMoreUrls === 'string') {
                    return fetchUrl(fetch, oneOrMoreUrls, fetchOptions)
                        .then(urlResult => ({ null: urlResult }));
                }

                throw new Error('Unsupported url type');
            });
    };
}

module.exports = urlProviderFactory;

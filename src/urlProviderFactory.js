'use strict';


function fetchUrl (fetch, url, fetchOptions) {
    return fetch(url, fetchOptions)
        .then((res) => {
            if (res.status < 200 || res.status >= 300) {
                throw new Error('The source url response status is not OK');
            }
            return res.json();
        });
}


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

    return () => {
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

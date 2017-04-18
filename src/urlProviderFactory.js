'use strict';

/**
 * @param fetch - fetch API compatible function
 * @param url
 * @returns {Promise.<DefinitionProvider>}
 */
function urlProviderFactory (fetch, url) {
    return (previous) => {
        if (previous) {
            return Promise.resolve(previous);
        }
        return fetch(url).then(res => res.json());
    };
}

module.exports = urlProviderFactory;

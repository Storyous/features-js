'use strict';

/**
 * @param fetch - fetch API compatible function
 * @param url
 * @returns {Promise.<DefinitionProvider>}
 */
function urlProviderFactory (fetch, url) {
    return () => fetch(url)
        .then(res => res.json());
}

module.exports = urlProviderFactory;

'use strict';

/**
 * @param {Function} fetch - fetch API compatible function
 * @param {string} url
 * @param {Object} [fetchOptions={}]
 * @returns {Promise.<DefinitionProvider>}
 */
function urlProviderFactory (fetch, url, fetchOptions = {}) {
    return () => fetch(url, fetchOptions)
        .then(res => res.json());
}

module.exports = urlProviderFactory;

'use strict';

/**
 * @param fetch - fetch API compatible function
 * @param url
 * @returns {Promise.<DefinitionProvider>}
 */

function urlProviderFactory(fetch, url) {
    return function (previous) {
        if (previous) {
            return Promise.resolve(previous);
        }
        return fetch(url).then(function (res) {
            return res.json();
        });
    };
}

module.exports = urlProviderFactory;
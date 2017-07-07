'use strict';

/**
 * @param {Function} fetch - fetch API compatible function
 * @param {string} url
 * @param {Object} [fetchOptions={}]
 * @returns {Promise.<DefinitionProvider>}
 */

function urlProviderFactory(fetch, url) {
    let fetchOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return () => fetch(url, fetchOptions).then(res => {
        if (res.status < 200 && res.status >= 300) {
            throw new Error('The source url response status is not OK');
        }
        return res.json();
    });
}

module.exports = urlProviderFactory;
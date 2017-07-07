'use strict';

/**
 * @param {Function} fetch - fetch API compatible function
 * @param {string} url
 * @param {Object} [fetchOptions={}]
 * @returns {Promise.<DefinitionProvider>}
 */

function urlProviderFactory(fetch, url) {
  var fetchOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return function () {
    return fetch(url, fetchOptions).then(function (res) {
      return res.json();
    });
  };
}

module.exports = urlProviderFactory;
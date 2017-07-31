'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function fetchUrl(fetch, url, fetchOptions) {
    return fetch(url, fetchOptions).then(function (res) {
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
function urlProviderFactory(fetch, source) {
    var fetchOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


    var urlProvider = source;
    if (typeof source === 'string') {
        urlProvider = function urlProvider() {
            return source;
        };
    }

    return function () {
        var deferredUrls = urlProvider();
        return Promise.resolve(deferredUrls).then(function (oneOrMoreUrls) {

            if ((typeof oneOrMoreUrls === 'undefined' ? 'undefined' : _typeof(oneOrMoreUrls)) === 'object') {
                var result = {
                    null: {}
                };
                return Object.keys(oneOrMoreUrls).reduce(function (prev, key) {
                    return prev.then(function () {
                        var url = oneOrMoreUrls[key];
                        return fetchUrl(fetch, url, fetchOptions).then(function (urlResult) {
                            result[key] = urlResult;
                        });
                    });
                }, Promise.resolve()).then(function () {
                    return result;
                });
            } else if (typeof oneOrMoreUrls === 'string') {
                return fetchUrl(fetch, oneOrMoreUrls, fetchOptions);
            }

            throw new Error('Unsupported url type');
        });
    };
}

module.exports = urlProviderFactory;
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var fetchUrl = require('./fetchUrl');

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

    /**
     * @param {Function} [callback]
     */
    return function (progressCallback) {
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
                            if (progressCallback) {
                                progressCallback();
                            }
                        });
                    });
                }, Promise.resolve()).then(function () {
                    return result;
                });
            } else if (typeof oneOrMoreUrls === 'string') {
                return fetchUrl(fetch, oneOrMoreUrls, fetchOptions).then(function (urlResult) {
                    return { null: urlResult };
                });
            }

            throw new Error('Unsupported url type');
        });
    };
}

module.exports = urlProviderFactory;
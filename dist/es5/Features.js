'use strict';

/**
 * @typedef {Object.<string, Object.<string, boolean>>} FeatureDefinitions
 */

/**
 * @callback DefinitionProvider
 * @returns {Promise.<FeatureDefinitions>}
 */

/**
 * @callback DefinitionProviderByUrl
 * @param {string} url
 * @returns {Promise.<FeatureDefinitions>}
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Features = function () {

    /**
     * @param {{
     *    provider: DefinitionProvider
     *    byUrlProvider?: DefinitionProviderByUrl
     *    cacheLifetime: number|null,
     *    onError?: Function
     *    onDefinitionsChange?: Function
     * }} options
     */
    function Features(options) {
        _classCallCheck(this, Features);

        /**
         * @type {FeatureDefinitions}
         */
        this._currentDefinitions = { null: {} };

        /**
         * @type {DefinitionProvider}
         */
        this._provider = options.provider;

        /**
         * @type {DefinitionProviderByUrl}
         */
        this._byUrlProvider = options.byUrlProvider;

        /**
         * @type {Function}
         */
        this._onError = options.onError || null;

        /**
         * @type {number|null}
         */
        this._timeoutId = null;

        /**
         * @type {number}
         */
        this._cacheLifetime = options.cacheLifetime == null ? null : options.cacheLifetime;

        /**
         * @type {Function}
         */
        this._onDefinitionsChange = options.onDefinitionsChange || null;

        if (this._provider) {
            this._firstLoadPromise = this._loadDefinitionsRepetitively();
        } else {
            this._firstLoadPromise = Promise.resolve();
        }
    }

    _createClass(Features, [{
        key: '_loadDefinitionsRepetitively',
        value: function _loadDefinitionsRepetitively() {
            var _this = this;

            return this._provider().catch(function (err) {
                if (_this._onError) {
                    _this._onError(err);
                }
                return null;
            }).then(function (def) {
                if (def) {
                    _this._currentDefinitions = def;
                    if (_this._onDefinitionsChange) {
                        _this._onDefinitionsChange(def);
                    }
                }
                if (typeof _this._cacheLifetime === 'number') {
                    _this._timeoutId = setTimeout(function () {
                        return _this._loadDefinitionsRepetitively();
                    }, _this._cacheLifetime);
                }
            });
        }

        /**
         * @returns {Promise}
         */

    }, {
        key: 'getReadyPromise',
        value: function getReadyPromise() {
            return this._firstLoadPromise;
        }

        /**
         * @returns {void}
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            if (this._timeoutId !== null) {
                clearTimeout(this._timeoutId);
            }
            this._cacheLifeTime = null; // prevent set new timeout if the loading is in process
        }

        /**
         * @param {string} key
         * @param {string} [id='null']
         * @returns {boolean}
         */

    }, {
        key: 'enabled',
        value: function enabled(key) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'null';

            if (id in this._currentDefinitions) {
                return this._currentDefinitions[id][key] || false;
            }
            return this._currentDefinitions.null[key] || false;
        }

        /**
         * @param {string} url
         * @param {string} key
         * @returns {Promise.<boolean>}
         */

    }, {
        key: 'enabledByUrl',
        value: function enabledByUrl(url, key) {
            var _this2 = this;

            return this._byUrlProvider(url).catch(function (err) {
                if (_this2._onError) {
                    _this2._onError(err);
                }
                return null;
            }).then(function (definitions) {

                if (definitions) {
                    return definitions[key];
                }

                return _this2._currentDefinitions.null[key] || false;
            });
        }
    }]);

    return Features;
}();

module.exports = Features;
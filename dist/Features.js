'use strict';

/**
 * @typedef {Object.<string, string[]|boolean>} FeatureDefinitions
 */

/**
 * @callback DefinitionProvider
 * @param {FeatureDefinitions} [freshDefinitions=null]
 * @returns {Promise.<FeatureDefinitions>}
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Features = function () {

    /**
     * @param {{
     *    defaultValue: *
     *    environment: string
     *    providers: DefinitionProvider[]
     *    cacheLifetime: number|null,
     *    onError?: Function
     * }} options
     * @param {FeatureDefinitions} [initialValue={}]
     */
    function Features(options) {
        var initialValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Features);

        /**
         * @type {FeatureDefinitions}
         */
        this._currentDefinitions = initialValue;

        /**
         * @type {string}
         */
        this._environment = options.environment;

        /**
         * @type {*}
         */
        this._defaultValue = options.defaultValue;

        /**
         * @type {DefinitionProvider[]}
         */
        this._providers = options.providers;

        /**
         * @type {Function}
         */
        this._onError = options.onError;

        /**
         * @type {number}
         */
        this._timeoutId = null;

        /**
         * @type {number}
         */
        this._cacheLifetime = options.cacheLifetime == null ? null : options.cacheLifetime;

        this._loadDefinitionsRepetitively();
    }

    _createClass(Features, [{
        key: '_loadDefinitionsRepetitively',
        value: function _loadDefinitionsRepetitively() {
            var _this = this;

            var lastValue = void 0;
            this._providers.reduce(function (previous, provider) {
                return previous.then(function (def) {
                    lastValue = def;
                    return provider(def);
                }, function (err) {
                    if (_this._onError) {
                        _this._onError(err);
                    }
                    return provider(lastValue);
                });
            }, Promise.resolve(null)).then(function (def) {
                if (def) {
                    _this._currentDefinitions = def;
                }
                if (typeof _this._cacheLifetime === 'number') {
                    _this._timeoutId = setTimeout(function () {
                        return _this._loadDefinitionsRepetitively();
                    }, _this._cacheLifetime);
                }
            });
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            if (this._timeoutId !== null) {
                clearTimeout(this._timeoutId);
            }
            this._cacheLifeTime = null; // prevent set new timeout if the loading is in process
        }

        /**
         * @returns {FeatureDefinitions}
         */

    }, {
        key: 'getFeatureDefinitions',
        value: function getFeatureDefinitions() {
            return this._currentDefinitions;
        }

        /**
         * @param {string} key
         * @returns {boolean}
         */

    }, {
        key: 'enabled',
        value: function enabled(key) {
            return this._resolveValue(this._currentDefinitions[key]);
        }
    }, {
        key: '_resolveValue',
        value: function _resolveValue(value) {

            if (typeof value === 'boolean') {
                return value;
            } else if (Array.isArray(value)) {
                return value.indexOf(this._environment) >= 0;
            }

            return this._defaultValue;
        }
    }]);

    return Features;
}();

module.exports = Features;
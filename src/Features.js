'use strict';

/**
 * @typedef {Object.<string, string[]|boolean>} FeatureDefinitions
 */

/**
 * @callback DefinitionProvider
 * @param {FeatureDefinitions} [freshDefinitions=null]
 * @returns {Promise.<FeatureDefinitions>}
 */

class Features {

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
    constructor (options, initialValue = {}) {

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

        this.firstLoadPromise = this._loadDefinitionsRepetitively();
    }

    _loadDefinitionsRepetitively () {
        let lastValue;
        return this._providers.reduce(
            (previous, provider) => previous.then(
                (def) => {
                    lastValue = def;
                    return provider(def);
                },
                (err) => {
                    if (this._onError) {
                        this._onError(err);
                    }
                    return provider(lastValue);
                }
            ),
            Promise.resolve(null)
        ).then((def) => {
            if (def) {
                this._currentDefinitions = def;
            }
            if (typeof this._cacheLifetime === 'number') {
                this._timeoutId = setTimeout(
                    () => this._loadDefinitionsRepetitively(),
                    this._cacheLifetime
                );
            }
        });
    }

    /**
     * @returns {Promise}
     */
    getReadyPromise () {
        return this.firstLoadPromise;
    }

    destroy () {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);
        }
        this._cacheLifeTime = null; // prevent set new timeout if the loading is in process
    }

    /**
     * @returns {FeatureDefinitions}
     */
    getFeatureDefinitions () {
        return this._currentDefinitions;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    enabled (key) {
        return this._resolveValue(this._currentDefinitions[key]);
    }

    _resolveValue (value) {

        if (typeof value === 'boolean') {
            return value;

        } else if (Array.isArray(value)) {
            return value.indexOf(this._environment) >= 0;
        }

        return this._defaultValue;
    }

}

module.exports = Features;

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

class Features {

    /**
     * @param {{
     *    provider: DefinitionProvider
     *    byUrlProvider?: DefinitionProviderByUrl
     *    cacheLifetime: number|null,
     *    onError?: Function
     *    onDefinitionsChange?: Function
     * }} options
     */
    constructor(options) {

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

    _loadDefinitionsRepetitively() {
        return this._provider().catch(err => {
            if (this._onError) {
                this._onError(err);
            }
            return null;
        }).then(def => {
            if (def) {
                this._currentDefinitions = def;
                if (this._onDefinitionsChange) {
                    this._onDefinitionsChange(def);
                }
            }
            if (typeof this._cacheLifetime === 'number') {
                this._timeoutId = setTimeout(() => this._loadDefinitionsRepetitively(), this._cacheLifetime);
            }
        });
    }

    /**
     * @returns {Promise}
     */
    getReadyPromise() {
        return this._firstLoadPromise;
    }

    /**
     * @returns {void}
     */
    destroy() {
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
    enabled(key) {
        let id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'null';

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
    enabledByUrl(url, key) {
        return this._byUrlProvider(url).catch(err => {
            if (this._onError) {
                this._onError(err);
            }
            return null;
        }).then(definitions => {

            if (definitions) {
                return definitions[key] || false;
            }

            return this._currentDefinitions.null[key] || false;
        });
    }

}

module.exports = Features;
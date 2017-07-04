'use strict';

/**
 * @typedef {Object.<string, Object.<string, boolean>>} FeatureDefinitions
 */

/**
 * @callback DefinitionProvider
 * @returns {Promise.<FeatureDefinitions>}
 */

class Features {

    /**
     * @param {{
     *    provider: DefinitionProvider
     *    cacheLifetime: number|null,
     *    onError?: Function
     *    onDefinitionsChange?: Function
     * }} options
     */
    constructor (options) {

        /**
         * @type {FeatureDefinitions}
         */
        this._currentDefinitions = { null: {} };

        /**
         * @type {DefinitionProvider}
         */
        this._provider = options.provider;

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

        this._firstLoadPromise = this._loadDefinitionsRepetitively();
    }

    _loadDefinitionsRepetitively () {
        return this._provider()
            .catch(() => null)
            .then((def) => {
                if (def) {
                    this._currentDefinitions = def;
                    if (this._onDefinitionsChange) {
                        this._onDefinitionsChange(def);
                    }
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
        return this._firstLoadPromise;
    }

    /**
     * @returns {void}
     */
    destroy () {
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
    enabled (key, id = 'null') {
        if (id in this._currentDefinitions) {
            return this._currentDefinitions[id][key] || false;
        }
        return this._currentDefinitions.null[key] || false;
    }

}

module.exports = Features;

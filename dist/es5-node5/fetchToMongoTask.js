'use strict';

const cronious = require('cronious');
const nodeFetch = require('node-fetch');
const urlProviderFactory = require('./urlProviderFactory');
const uuid = require('uuid');

class FetchToMongoTask extends cronious.Task {

    /**
     * @param {{
     *    sourceUrl: string,
     *    collection: mongodb.Collection
     *    fetchOptions?: Object,
     *    taskId?: string
     *    lifetime?: number,
     * }} options
     */
    constructor(options) {

        super(options.taskId || 'FetchToMongoTask');

        this._collection = options.collection;

        this._lifetime = options.lifetime || 30000;

        this._provider = urlProviderFactory(nodeFetch, options.sourceUrl, options.fetchOptions || {});
    }

    run(progressCallback) {
        return this._provider(progressCallback).then(definitions => {

            const changeId = uuid.v4(); // random
            const updates = Object.keys(definitions).map(key => {
                const newDocument = {
                    _id: key,
                    changeId: changeId,
                    type: 'features',
                    definitions: definitions[key]
                };

                return {
                    replaceOne: {
                        filter: { _id: key },
                        replacement: newDocument,
                        upsert: true
                    }
                };
            });

            return this._collection.bulkWrite(updates, { ordered: false }).then(() => this._collection.removeMany({
                // null because of other document without feature flags, CRON for example
                type: 'features',
                changeId: {
                    $ne: changeId
                }
            }));
        });
    }

    getNextTime() {
        return new Date(Date.now() + this._lifetime);
    }

}

module.exports = FetchToMongoTask;
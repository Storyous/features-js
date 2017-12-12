'use strict';

const cronious = require('cronious');
const nodeFetch = require('node-fetch');
const urlProviderFactory = require('./urlProviderFactory');
const mongodb = require('mongodb');

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
    constructor (options) {

        super(options.taskId || 'FetchToMongoTask');

        this._collection = options.collection;

        this._lifetime = options.lifetime || 30000;

        this._provider = urlProviderFactory(
            nodeFetch,
            options.sourceUrl,
            options.fetchOptions || {}
        );

    }

    run (progressCallback) {
        return this._provider(progressCallback)
            .then((definitions) => {

                const changeId = new mongodb.ObjectId();
                const updates = Object.keys(definitions).map((key) => {
                    const newDocument = {
                        _id: key,
                        changeId,
                        type: 'features',
                        definitions: definitions[key]
                    };

                    return {
                        updateOne: {
                            filter: { _id: key },
                            update: newDocument,
                            upsert: true
                        }
                    };
                });

                return this._collection.bulkWrite(updates, { ordered: false })
                    .then(() => this._collection.removeMany({
                        // null because of other document without feature flags, CRON for example
                        changeId: {
                            type: 'features',
                            $ne: changeId
                        }
                    }));
            });
    }

    getNextTime () {
        return new Date(Date.now() + this._lifetime);
    }

}

module.exports = FetchToMongoTask;

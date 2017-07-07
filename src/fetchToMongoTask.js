'use strict';

const cronious = require('cronious');
const nodeFetch = require('node-fetch');
const defaultDocumentId = require('./defaultDocumentId');
const urlProviderFactory = require('./urlProviderFactory');

class FetchToMongoTask extends cronious.Task {

    /**
     * @param {{
     *    sourceUrl: string,
     *    collection: mongodb.Collection
     *    fetchOptions?: Object,
     *    documentId?: string
     *    taskId?: string
     *    lifetime?: number,
     * }} options
     */
    constructor (options) {

        super(options.taskId || 'FetchToMongoTask');

        this._collection = options.collection;

        this._lifetime = options.lifetime || 30000;

        this._documentId = options.documentId || defaultDocumentId;

        this._provider = urlProviderFactory(
            nodeFetch,
            options.sourceUrl,
            options.fetchOptions || {}
        );

    }

    run () {
        return this._provider()
            .then(definitions => this._collection.findOneAndUpdate(
                { _id: this._documentId },
                definitions,
                { upsert: true }
            ));
    }

    getNextTime () {
        return new Date(Date.now() + this._lifetime);
    }

}

module.exports = FetchToMongoTask;

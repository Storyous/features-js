'use strict';

const cronious = require('cronious');
const nodeFetch = require('node-fetch');
const defaultDocumentId = require('./defaultDocumentId');

class FetchToMongoTask extends cronious.Task {

    /**
     * @param {{
     *    sourceUrl: string,
     *    collection: mongodb.Collection
     *    documentId?: string
     *    taskId?: string
     *    lifetime?: number,
     * }} options
     */
    constructor (options) {

        super(options.taskId || 'FetchToMongoTask');

        this._sourceUrl = options.sourceUrl;

        this._collection = options.collection;

        this._lifetime = options.lifetime || 30000;

        this._documentId = options.documentId || defaultDocumentId;
    }

    run () {
        return nodeFetch(this._sourceUrl)
            .then(res => res.json())
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

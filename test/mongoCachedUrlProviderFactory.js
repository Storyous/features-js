'use strict';

const sinon = require('sinon');
const mongoCachedUrlProviderFactory = require('../src').mongoCachedUrlProviderFactory;
const mongodb = require('mongodb');
const assert = require('assert');
const nodeFetch = require('node-fetch');
const MockServer = require('./utils/mockServer');

describe('mongoCachedUrlProviderFactory', function () {

    let collection;
    let mockServer = null;
    const mockServerUrl = 'http://127.0.0.1:5001';

    before(function (done) {
        return mongodb.connect('mongodb://127.0.0.1:27017/featuresJsTests', null, (err, db) => {
            collection = db.collection('featuresCollection');
            mockServer = new MockServer(mockServerUrl, done);
        });
    });

    beforeEach(function () {
        return collection.remove();
    });

    afterEach((done) => {
        mockServer.reset(done);
    });

    after((done) => {
        mockServer.close(done);
    });

    it('should call server for definitions, return them and cache in mongo', () => {

        const provider = mongoCachedUrlProviderFactory(nodeFetch, collection);

        const expectedDefinitons = {
            feature1: true,
            feature2: false
        };

        const handler = sinon.spy((req, res) => {
            res.send(expectedDefinitons);
        });

        mockServer.handleNext('/', handler);
        mockServer.handleNext('/', handler);

        return provider(mockServerUrl)
            .then((definitions) => {
                assert.deepEqual(definitions, expectedDefinitons);
                assert(handler.calledOnce);

                return collection.findOne({
                    _id: mockServerUrl,
                    type: 'featuresByUrl'
                });
            })
            .then((document) => {
                assert(document);
                assert.deepEqual(document.definitions, expectedDefinitons);

                return provider(mockServerUrl);
            })
            .then((definitions) => {

                assert(handler.calledOnce, 'The seconf call should be resolved by mongo cache');

                assert.deepEqual(definitions, expectedDefinitons);
            });
    });

    it('should not use cache if cacheLifeTime expires', () => {

        const provider = mongoCachedUrlProviderFactory(nodeFetch, collection, {
            cacheLifeTime: -1000
        });

        const expectedDefinitons = {
            feature1: true,
            feature2: false
        };

        const handler = sinon.spy((req, res) => {
            res.send(expectedDefinitons);
        });

        mockServer.handleNext('/', handler);
        mockServer.handleNext('/', handler);

        return provider(mockServerUrl)
            .then((definitions) => {
                assert.deepEqual(definitions, expectedDefinitons);

                return collection.findOne({
                    _id: mockServerUrl,
                    type: 'featuresByUrl'
                });
            })
            .then((document) => {
                assert(document);

                return provider(mockServerUrl);
            })
            .then((definitions) => {

                assert(handler.calledTwice, 'The second call should be resolved by url too.');

                assert.deepEqual(definitions, expectedDefinitons);
            });
    });

});

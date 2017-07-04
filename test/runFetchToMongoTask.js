'use strict';

const sinon = require('sinon');
const assert = require('assert');
const mongodb = require('mongodb');
const features = require('../src');

const runFetchToMongoTask = features.runFetchToMongoTask;
const MockServer = require('./utils/mockServer');


describe('runFetchToMongoTask', function () {

    let collection;
    let mockServer = null;

    const wait = time => new Promise((resolve) => {
        setTimeout(resolve, time);
    });

    before(function (done) {
        return mongodb.connect('mongodb://127.0.0.1:27017/featuresJsTests', null, (err, db) => {
            collection = db.collection('featuresCollection');
            mockServer = new MockServer(5000, done);
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

    it('should run task properly, fetch data and store them into DB', function () {

        const sourceUrl = 'http://localhost:5000';
        const sourcePath = '/api/features';
        const taskOptions = { sourceUrl: sourceUrl + sourcePath, collection, lifetime: 1 };
        let taskStopObject = null;
        let featureService = null;

        const definitionChange = sinon.spy();

        mockServer.handleNext(sourcePath, (req, res) => {
            res.json({ null: { feature1: true } });
        });

        return runFetchToMongoTask(taskOptions)
            .then((stopObject) => {
                taskStopObject = stopObject;
                return wait(100);
            })
            .then(() => taskStopObject.stopFetchToMongoTask())
            .then(() => {

                featureService = new features.Features({
                    provider: features.mongoProviderFactory(collection),
                    onDefinitionsChange: definitionChange
                });

                return featureService.getReadyPromise();
            })
            .then(() => {
                assert(featureService.enabled('feature1', '58dab243332f920e00b6cd17') === true, 'Feature should be true when document is loaded by task and service is initialized.');
                assert(definitionChange.called);
            });
    });
});

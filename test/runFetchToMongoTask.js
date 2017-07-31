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
            res.json({ feature1: true });
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

    it('should run task properly, fetch data from multiple urls and store them into DB', function () {

        const sourcePath = '/api/features';
        const sourceUrls = () => Promise.resolve({
            null: `http://localhost:5000${sourcePath}`,
            a1: `http://localhost:5000${sourcePath}?a=1`,
            a2: `http://localhost:5000${sourcePath}?a=2`
        });
        const taskOptions = { sourceUrl: sourceUrls, collection, lifetime: 1 };
        let taskStopObject = null;
        let featureService = null;

        const definitionChange = sinon.spy();

        mockServer
            .handleNext(sourcePath, (req, res) => {
                // todo check the query
                res.json({
                    nullFeature: true,
                    a1Feature: false,
                    a2Feature: false
                });
            })
            .handleNext(sourcePath, (req, res) => {
                // todo check the query
                res.json({
                    nullFeature: false,
                    a1Feature: true,
                    a2Feature: false
                });
            })
            .handleNext(sourcePath, (req, res) => {
                // todo check the query
                res.json({
                    nullFeature: false,
                    a1Feature: false,
                    a2Feature: true
                });
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
                assert.equal(featureService.enabled('nullFeature'), true);
                assert.equal(featureService.enabled('a1Feature'), false);
                assert.equal(featureService.enabled('a2Feature'), false);
                assert.equal(featureService.enabled('nullFeature', 'a1'), false);
                assert.equal(featureService.enabled('a1Feature', 'a1'), true);
                assert.equal(featureService.enabled('a2Feature', 'a1'), false);
                assert.equal(featureService.enabled('nullFeature', 'a2'), false);
                assert.equal(featureService.enabled('a1Feature', 'a2'), false);
                assert.equal(featureService.enabled('a2Feature', 'a2'), true);

                assert(definitionChange.called);
            });
    });
});

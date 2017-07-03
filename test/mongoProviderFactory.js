'use strict';

const mongoProviderFactory = require('../src').mongoProviderFactory;
const mongodb = require('mongodb');
const assert = require('assert');

describe('mongoProviderFactory', function () {

    let collection;
    const id = 'features';

    before(function () {
        return mongodb.connect('mongodb://127.0.0.1:27017/featuresJsTests')
            .then((db) => {
                collection = db.collection('featuresCollection');
            });
    });

    beforeEach(function () {
        return collection.remove();
    });

    it('should return null when the doc is missing', function () {
        const expectedData = null;
        const provider = mongoProviderFactory(collection, id);

        return provider().then((data) => {
            assert.deepEqual(data, expectedData, 'Definition does not match');
        });
    });

    it('should return and save previous value if exists', function () {
        const expectedData = { null: { featureId: true } };
        const provider = mongoProviderFactory(collection, id);

        return collection.insertOne(Object.assign({ _id: id }, expectedData))
            .then(() => provider())
            .then((data) => {

                assert.deepEqual(data, expectedData, 'Definition while saving does not match');

                return provider();
            })
            .then((data) => {
                assert.deepEqual(data, expectedData, 'Definition with loading does not match');
            });
    });


});

'use strict';

const mongoProviderFactory = require('../src').mongoProviderFactory;
const mongodb = require('mongodb');
const assert = require('assert');

describe('mongoProviderFactory', function () {

    let collection;

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
        const provider = mongoProviderFactory(collection);

        return provider().then((data) => {
            assert.deepEqual(data, expectedData, 'Definition does not match');
        });
    });

    it('should return and save previous value if exists', function () {
        const expectedData = { null: { featureId: true } };
        const provider = mongoProviderFactory(collection);

        return collection.insertOne({ _id: 'null', type: 'features', definitions: expectedData.null })
            .then(() => provider())
            .then((data) => {

                assert.deepEqual(data, expectedData, 'Definition while saving does not match');

            });
    });


});

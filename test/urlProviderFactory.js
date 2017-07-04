'use strict';

const sinon = require('sinon');
const urlProviderFactory = require('../src').urlProviderFactory;
const assert = require('assert');

describe('urlProviderFactory', function () {

    const testUrl = 'sdf65486w4efwef';

    const createFetcher = (expectedUrl, returnValue) => sinon.spy((url) => {
        assert.equal(url, expectedUrl, 'Url does not match');

        if (returnValue instanceof Promise) {
            return returnValue;
        }

        return Promise.resolve({
            json: () => Promise.resolve(returnValue)
        });
    });


    it('should return object from url', function () {
        const expectedData = {};
        const fetcher = createFetcher(testUrl, expectedData);
        const provider = urlProviderFactory(fetcher, testUrl);

        return provider().then((data) => {
            assert.deepEqual(data, expectedData, 'Definition does not match');
            assert(fetcher.calledOnce);
        });
    });

    it('should propagate error from fetcher', function () {
        const someError = new Error('Some error');
        const fetcher = createFetcher(testUrl, Promise.reject(someError));
        const provider = urlProviderFactory(fetcher, testUrl);

        return provider().then(() => {
            throw new Error('This should not happen!');
        }, (err) => {
            assert.equal(err, someError);
            assert(fetcher.calledOnce);
        });
    });

});

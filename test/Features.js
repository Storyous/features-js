'use strict';

const Features = require('../src').Features;
const sinon = require('sinon');
const assert = require('assert');

describe('Features', function () {

    const wait = time => new Promise((resolve) => {
        setTimeout(resolve, time);
    });

    let features;
    afterEach(() => features.destroy());

    // works
    // handle when the provider fails

    it('should return proper values', function () {

        const definitions = {
            featureAsBool: true,
            featureAsArrayEnabled: ['test', 'production'],
            featureAsArrayDisabled: ['test', 'staging'],
            featureAsNull: null,
            featureAsNumber: 999
        };

        const provider1 = sinon.spy(() => Promise.resolve(definitions));

        features = new Features({
            defaultValue: false,
            environment: 'production',
            cacheLifetime: 1,
            providers: [
                provider1
            ]
        });

        assert.strictEqual(features.enabled('featureAsBool'), false, 'Should return default value before first fetch');

        return wait(5).then(() => {
            assert(provider1.callCount > 0, 'The provider should be called at least once');
            assert.strictEqual(features.enabled('featureAsBool'), true);
            assert.strictEqual(features.enabled('featureAsArrayEnabled'), true);
            assert.strictEqual(features.enabled('featureAsArrayDisabled'), false);
            assert.strictEqual(features.enabled('featureAsNull'), false);
            assert.strictEqual(features.enabled('featureAsNumber'), false);

            assert.deepEqual(features.getFeatureDefinitions(), definitions);
        });

    });

    it('should not propagate error and use value from second provider', function () {

        const definitions = {
            featureAsBool: true
        };

        const provider1 = sinon.spy(() => Promise.reject(new Error('Some error')));
        const provider2 = sinon.spy(() => Promise.resolve(definitions));

        features = new Features({
            defaultValue: false,
            environment: 'production',
            cacheLifetime: null,
            providers: [
                provider1,
                provider2
            ]
        });

        return wait(100).then(() => {
            assert(provider1.callCount > 0, 'The provider1 should be called at least once');
            assert(provider2.callCount > 0, 'The provider2 should be called at least once');
            assert.strictEqual(features.enabled('featureAsBool'), true);

            assert.deepEqual(features.getFeatureDefinitions(), definitions);
        });

    });

    it('should propagate data from previous successful provider', function () {

        const definitions = {
            featureAsBool: true
        };

        const provider1 = sinon.spy(() => Promise.resolve(definitions));
        const provider2 = sinon.spy(previous => Promise.resolve(previous));

        features = new Features({
            defaultValue: false,
            environment: 'production',
            cacheLifetime: null,
            providers: [
                provider1,
                provider2
            ]
        });

        return wait(100).then(() => {
            assert(provider1.callCount > 0, 'The provider2 should be called at least once');
            assert.strictEqual(provider2.firstCall.args[0], definitions);

            assert.deepEqual(features.getFeatureDefinitions(), definitions);
        });

    });

});

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
            null: {
                featureAsBool: true,
                featureAsArrayEnabled: false,
                featureAsArrayDisabled: true,
                featureAsNull: true,
                featureAsNumber: false
            }
        };

        const provider = sinon.spy(() => Promise.resolve(definitions));

        features = new Features({
            cacheLifetime: 1,
            provider
        });

        return features.getReadyPromise().then(() => {
            assert(provider.callCount > 0, 'The provider should be called at least once');
            assert.strictEqual(features.enabled('featureAsBool'), true);
            assert.strictEqual(features.enabled('featureAsArrayEnabled'), false);
            assert.strictEqual(features.enabled('featureAsArrayDisabled'), true);
            assert.strictEqual(features.enabled('featureAsNull'), true);
            assert.strictEqual(features.enabled('featureAsNumber'), false);
        });

    });

    it('should do another request if last provider fails', function () {

        let rejected = false;

        const provider = sinon.spy(() => {

            if (!rejected) {
                rejected = true;
                return Promise.reject(new Error('Some error'));
            }

            return Promise.resolve({ null: { featureAsBool: true } });
        });

        features = new Features({
            cacheLifetime: 1,
            provider
        });

        assert.strictEqual(features.enabled('featureAsBool'), false);

        return wait(100).then(() => {
            assert(provider.callCount > 1, 'The provider should be called at least once');
            assert.strictEqual(features.enabled('featureAsBool'), true);
        });

    });

});

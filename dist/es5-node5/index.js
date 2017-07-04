'use strict';

const Features = require('./Features');
const mongoProviderFactory = require('./mongoProviderFactory');
const urlProviderFactory = require('./urlProviderFactory');
const runFetchToMongoTask = require('./runFetchToMongoTask');

module.exports = {

    Features: Features,

    mongoProviderFactory: mongoProviderFactory,

    urlProviderFactory: urlProviderFactory,

    runFetchToMongoTask: runFetchToMongoTask

};
'use strict';

const cronious = require('cronious');
const FetchToMongoTask = require('./fetchToMongoTask');

/**
 * @param {{
     *    sourceUrl: (string|string[]|function (): Promise.<string[]>|function (): Promise.<string>)
     *    collection: mongodb.Collection
     *    taskId?: string
     *    lifetime?: number,
     * }} taskOptions
 * @returns {Promise.<Function>}
 */
module.exports = function (taskOptions) {

    const runner = new cronious.Runner({
        collection: taskOptions.collection,
        checkInterval: 10 * 1000
    });

    const task = new FetchToMongoTask(taskOptions);

    return runner.registerTask(task)
        .then(() => {

            runner.startTriggeringTasks();

            return {
                stopFetchToMongoTask: () => runner.stopTriggeringTasks()
            };
        });
};

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cronious = require('cronious');
var nodeFetch = require('node-fetch');
var urlProviderFactory = require('./urlProviderFactory');
var mongodb = require('mongodb');

var FetchToMongoTask = function (_cronious$Task) {
    _inherits(FetchToMongoTask, _cronious$Task);

    /**
     * @param {{
     *    sourceUrl: string,
     *    collection: mongodb.Collection
     *    fetchOptions?: Object,
     *    taskId?: string
     *    lifetime?: number,
     * }} options
     */
    function FetchToMongoTask(options) {
        _classCallCheck(this, FetchToMongoTask);

        var _this = _possibleConstructorReturn(this, (FetchToMongoTask.__proto__ || Object.getPrototypeOf(FetchToMongoTask)).call(this, options.taskId || 'FetchToMongoTask'));

        _this._collection = options.collection;

        _this._lifetime = options.lifetime || 30000;

        _this._provider = urlProviderFactory(nodeFetch, options.sourceUrl, options.fetchOptions || {});

        return _this;
    }

    _createClass(FetchToMongoTask, [{
        key: 'run',
        value: function run(progressCallback) {
            var _this2 = this;

            return this._provider(progressCallback).then(function (definitions) {

                var changeId = new mongodb.ObjectId();
                var updates = Object.keys(definitions).map(function (key) {
                    var newDocument = {
                        _id: key,
                        changeId: changeId,
                        type: 'features',
                        definitions: definitions[key]
                    };

                    return {
                        updateOne: {
                            filter: { _id: key },
                            update: newDocument,
                            upsert: true
                        }
                    };
                });

                return _this2._collection.bulkWrite(updates, { ordered: false }).then(function () {
                    return _this2._collection.removeMany({
                        // null because of other document without feature flags, CRON for example
                        type: 'features',
                        changeId: {
                            $ne: changeId
                        }
                    });
                });
            });
        }
    }, {
        key: 'getNextTime',
        value: function getNextTime() {
            return new Date(Date.now() + this._lifetime);
        }
    }]);

    return FetchToMongoTask;
}(cronious.Task);

module.exports = FetchToMongoTask;
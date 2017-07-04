'use strict';

const url = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const assert = require('assert');

class MockServer {

    constructor (urlOrPort, done) {

        this.handlerProcessed = 0;

        if (typeof urlOrPort === 'number') {
            this._port = urlOrPort;

        } else {
            const parsed = url.parse(urlOrPort);
            this._port = parsed.port;
        }

        if (!this._app) {
            this._app = express();

            this._app.use(bodyParser.json());

            this._server = this._app.listen(this._port, () => {
                done();
            });

            this._handlers = [];

            this._app.use((req, res) => {
                const currentHandler = this._handlers.shift();
                if (currentHandler) {
                    assert.equal(req.path, currentHandler.path, 'The path does not match');
                    this.handlerProcessed++;
                    currentHandler.handler(req, res);
                } else {
                    throw new Error('No handler registered.');
                }
            });
        }
    }

    handleNext (path, handler) {
        this._handlers.push({ path, handler });
        return this;
    }

    reset (done) {
        this._handlers.splice(0, this._handlers.length);
        this.handlerProcessed = 0;
        done();
    }

    close (done) {
        this._server.close();
        done();
    }

}

module.exports = MockServer;

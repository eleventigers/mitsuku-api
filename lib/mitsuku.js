'use strict';

var Promise = require('bluebird'),
    cheerio = require('cheerio'),
    superagent = require('superagent');

var ENDPOINT_CHAT_MITSUKU = 'https://kakko.pandorabots.com/pandora/talk?botid=87437a824e345a0d&skin=chat',
    MESSAGE_REGEX = /(Mitsuku -(.*))/,
    MESSAGE_REJECT_REGEX = /(x(.*)x[^\s]+)|(\|)|(BYESPLIT X1234)/ig,
    MESSAGE_SENDER_TAG = 'You -';

function getRawHtmlForMessage(mitsuku, message) {
    return new Promise(function (resolve, reject) {
        if (!mitsuku) {
            return reject(new Error('Mitsuku cannot be null'));
        }
        if (!message) {
            return reject(new Error('Message cannot be null or empty'));
        }

        var agent = mitsuku._agent,
            endpoint = mitsuku._endpoint,
            req;

        req = agent.post(endpoint);
        agent.attachCookies(req);
        req.set('Content-Type', 'application/x-www-form-urlencoded')
            .send({ message: message })
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }
                agent.saveCookies(res);
                resolve(res.text);
            });
    });
}

function parseMessageFromHtml(html) {
    var conv = cheerio.load(html)('body')
        .find('p')
        .text()
        .trim();

    var match = MESSAGE_REGEX.exec(conv),
        message,
        prevMessageStart;

    if (match && match.length > 0) {
        message = match[match.length - 1];
        prevMessageStart = message.indexOf(MESSAGE_SENDER_TAG);
        if (prevMessageStart != -1) {
            message = message.substr(0, prevMessageStart);
        }
        return message.replace(MESSAGE_REJECT_REGEX, '').trim();
    } else {
        throw new Error("Could not parse Mitsuku response");
    }
}

/**
 * Create new Mitsuku API for the given options.
 *
 * @param options
 * @constructor
 */
function Mitsuku(options) {
    options = options || {};
    this._tag = options.tag || 'Anonymous';
    this._agent = superagent.agent();
    this._endpoint = options.endpoint || ENDPOINT_CHAT_MITSUKU;
}

/**
 * Send a message to this {@link Mitsuku} instance.
 *
 * @param message
 * @return bluebird message response promise
 */
Mitsuku.prototype.send = function(message) {
    return getRawHtmlForMessage(this, message)
        .then(parseMessageFromHtml)
};

/**
 * Get the tag this {@link Mitsuku} was setup with.
 *
 * @returns {*|string}
 */
Mitsuku.prototype.getTag = function() {
    return '' + this._tag;
};

/**
 * Describe this {@link Mitsuku} instance.
 *
 * @returns {*|string}
 */
Mitsuku.prototype.toString = function() {
    return this.getTag();
};

/**
 * Mitsuku API module
 * @module lib/mitsuku
 */

/**
 * Create new instance of {@link Mitsuku} for the given options.
 *
 * @param options
 * @returns {Mitsuku}
 */
module.exports = function newInstance(options) {
    return new Mitsuku(options);
};

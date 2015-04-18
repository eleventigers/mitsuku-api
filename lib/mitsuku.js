'use strict';

var Promise = require('bluebird'),
    cheerio = require('cheerio'),
    sanitizer = require('sanitizer');

/**
 * @param options
 * @constructor
 */
function Mitsuku(options) {
    options = options || {};
    this.name = options.name || 'Anonymous';
    this.agent = require('superagent').agent();
}

/**
 * Send a message to this {@link Mitsuku} instance.
 *
 * @param message
 * @return bluebird message response promise
 */
Mitsuku.prototype.message = function(message) {
    return getRawHtmlForMessage(this.agent, message)
        .then(function (res) {
            return getMessageFromRawHtml(res);
        })
};

/**
 * Get the name this {@link Mitsuku} was setup with.
 *
 * @returns {*|string}
 */
Mitsuku.prototype.getName = function() {
    return this.name;
};

/**
 * Describe this {@link Mitsuku} instance.
 *
 * @returns {*|string}
 */
Mitsuku.prototype.toString = function() {
    return this.name;
};

var MESSAGE_REGEX = /(Mitsuku:(.*))/,
    MESSAGE_REJECT_REGEX = /(xloadswf(.*)xloadswf\.)/ig,
    MESSAGE_SENDER_TAG = 'You:';

function getMessageFromRawHtml(html) {
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
        message = message.replace(MESSAGE_REJECT_REGEX, '').trim();
        return sanitizer.sanitize(message);
    } else {
        throw new Error("Could not parse Mitsuku response");
    }
}

var ENDPOINT_CHAT_MITSUKU = 'http://fiddle.pandorabots.com/pandora/talk?botid=9fa364f2fe345a10&skin=demochat';

function getRawHtmlForMessage(agent, message) {
    return new Promise(function (resolve, reject) {
        if (!message) {
            return reject(new Error('Message cannot be null or empty'));
        }
        var req = agent.post(ENDPOINT_CHAT_MITSUKU);
        agent.attachCookies(req);
        req.set('Content-Type', 'application/x-www-form-urlencoded')
            .send({message: message})
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }
                agent.saveCookies(res);
                resolve(res.text);
            });
    });
}

module.exports = function newInstance(options) {
    return new Mitsuku(options);
};

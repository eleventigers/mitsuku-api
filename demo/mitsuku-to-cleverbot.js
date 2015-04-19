'use strict';

var factory = require('../'),
    say = require('say'),
    Promise = require('bluebird'),
    Cleverbot = require('cleverbot-node');

var m1 = proxyCleverbot({cleverbot: new Cleverbot(), tag: 'voice_cmu_us_slt_arctic_clunits'}),
    m2 = factory({tag: 'voice_cmu_us_jmk_arctic_clunits'});

var START_WITH_PHRASE = 'Hello';

function loopConverse(sender, receiver, prevMessage, nextMessage) {
    var prev = prevMessage || nextMessage;
    console.log(receiver + ": " + nextMessage);
    return new Promise(function (resolve, reject) {
        say.speak(sender.getTag(), nextMessage, function () {
            resolve(sender.send(nextMessage)
                .then(function (response) {
                    var repeated = flatten(response) == flatten(nextMessage),
                        next = response;
                    if (repeated) {
                        next = reverse(next);
                    }
                    return loopConverse(receiver, sender, prev, next);
                }));
        });
    });
}

function flatten(s) {
    return s.replace(/[^a-zA-Z\d]/g, '').toLowerCase();
}

function reverse(s){
    return s.split("").reverse().join("");
}

function proxyCleverbot(options) {
    options = options || {};
    var cleverbot = options.cleverbot,
        tag = options.tag || 'Anonymous';
    return {
        send: function(message) {
            return new Promise(function (resolve, reject) {
                cleverbot.write(message, function (res) {
                    var message = res.message || '';
                    resolve(message);
                });
            });
        },
        getTag: function() {
            return '' + tag;
        },
        toString: function() {
            return this.getTag();
        }
    }
}

loopConverse(m1, m2, null, START_WITH_PHRASE);

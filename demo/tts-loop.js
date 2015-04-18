'use strict';

var factory = require('../'),
    say = require('say'),
    Promise = require('bluebird');

var m1 = factory({name: 'voice_cmu_us_jmk_arctic_clunits'}),
    m2 = factory({name: 'voice_cmu_us_slt_arctic_clunits'});

var START_WITH_PHRASE = 'hello';

function loopConverse(sender, receiver, prevMessage, nextMessage) {
    var prev = prevMessage || nextMessage;
    console.log(sender + ": " + nextMessage);
    return new Promise(function (resolve, reject) {
        say.speak(sender.getName(), nextMessage, function () {
            resolve(sender.message(nextMessage)
                .then(function (response) {
                    var next = response != nextMessage ? response : prevMessage;
                    return loopConverse(receiver, sender, prev, next);
                }));
        });
    });
}

loopConverse(m1, m2, null, START_WITH_PHRASE);

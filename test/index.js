'use strict';

var test = require('tape');

test('Summoning one is easy peasy', function (t) {
    t.plan(3);

    t.ok(require('../')(), "New instance with no options");
    t.ok(require('../')({}), "New instance with empty options");
    t.notEqual(require('../')(), require('../')(), "New instances not equal");
});

test('Prompt to send and receive messages', function(t) {
    t.plan(3);

    var mitsuku = require('../')(),
        promise = mitsuku.send();

    t.ok(promise, 'Get a promise sending a message');
    promise.catch(function (e) {
        t.ok(e, 'Throws error for an empty message');
    });

    promise = mitsuku.send('nice day');

    promise.then(function (m) {
        t.ok(m && m.length > 0, 'Non null and not empty message response');
    });
});

test('Remembering names is not a problem', function(t) {
    t.plan(3);

    var mitsuku = require('../')(),
        myName = "Joe",
        botName = "Mitsuku";

    mitsuku.send('Hello, my name is ' + myName)
        .then(function (m) {
            t.ok(m, "Responds to greeting with a name " + myName);
            return mitsuku.send('What is my name?')
                .then(function (m) {
                    t.ok(m.indexOf(myName) != -1, "Remembers that my name is " + myName);
                    return mitsuku.send("What is your name?")
                        .then(function (m) {
                            t.ok(m.indexOf(botName) != -1, "Knows her name is " + botName);
                        })
                })
        })
        .catch(function (e) {
            t.error(e);
        });
});

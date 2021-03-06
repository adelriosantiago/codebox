var Q = require('q');
var path = require("path");
var codebox = require("../lib");
var users = require("../lib/users");

var config = {
    log: false,
    root: path.resolve(__dirname, "workspace")
};

// Expose assert globally
global.assert = require('assert');

// Init before doing tests
before(function(done) {
    this.timeout(500000);

    qdone(
        codebox.prepare(config)
        .then(function() {
            return users.auth("test", "test");
        }),
    done);
});

// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};

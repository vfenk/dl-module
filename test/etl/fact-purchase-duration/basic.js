var helper = require("../../helper");
var Manager = require("../../../src/etl/fact-purchase-duration-etl-manager");
var instanceManager = null;
var should = require("should");

before("#00. connect db", function(done) {
    helper.getDb()
        .then((db) => {
            instanceManager = new Manager(db, {
                username: "unit-test"
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it("#01. should error when create new buyer with empty data", function(done) {
    instanceManager.run()
        .then(() => {
            done("Should not be able to create data with empty data");
        })
        .catch((e) => {
            done(e);
        });
});

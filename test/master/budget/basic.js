var helper = require("../../helper");
var BudgetData = require("../../data-util/master/budget-data-util");
var BudgetManager = require("../../../src/managers/master/budget-manager");
var instanceManager = null;
var validateBudget = require("dl-models").validator.budget;

require("should");

before("#00. connect db", function(done) {
    helper.getDb()
        .then((db) => {
            instanceManager = new BudgetManager(db, {
                username: "unit-test"
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

var createdId;
it("#01. should success when create new data", function(done) {
    BudgetData.getNewData()
        .then(instanceManager.create)
        .then((id) => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch((e) => {
            done(e);
        });
});

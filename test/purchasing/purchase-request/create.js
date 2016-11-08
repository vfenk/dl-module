require("should");
var dataUtil = require('../../data').transaction.purchaseRequest;
var helper = require("../../helper");
var validatePR = require("dl-models").validator.purchasing.purchaseRequest;

var PurchaseRequestManager = require("../../../src/managers/purchasing/purchase-request-manager");
var purchaseRequestManager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            purchaseRequestManager = new PurchaseRequestManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var purchaseRequest;
it('#01. should success when create new data', function (done) {
    dataUtil.getNew()
        .then(pr => {
            purchaseRequest = pr;
            validatePR(purchaseRequest);
            done();
        })
        .catch(e => {
            done(e);
        });
});



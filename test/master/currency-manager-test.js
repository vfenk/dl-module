
var helper = require("../helper");
var CurrencyManager = require("../../src/managers/master/currency-manager");
var instanceManager = null;
var validator = require('dl-models').validator.currency;

require("should");

function getData() {
    var Currency = require('dl-models').master.Currency;
    var currency = new Currency(); 

    currency.code = 'IDR';
    currency.symbol = 'Rp';
    currency.rate = 1; 
    currency.description = 'rupiah';
    return currency;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new CurrencyManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#01. should success when create new data', function (done) {
    var data = getData();
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});
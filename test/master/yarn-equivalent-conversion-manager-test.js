var helper = require("../helper");
var YarnEquivalentConversionManager = require("../../src/managers/master/yarn-equivalent-conversion-manager");
var instanceManager = null;
var validator = require('dl-models').validator.yarnEquivalentConversion;

require("should");

function getData() {
    var YarnEquivalentConversion = require('dl-models').master.YarnEquivalentConversion;
    var yarnEquivalentConversion = new YarnEquivalentConversion();
 
    yarnEquivalentConversion.ne = 3.8;
    yarnEquivalentConversion.conversionRatio = 1.5; 
    return yarnEquivalentConversion;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new YarnEquivalentConversionManager(db, {
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

it('#02. should error when create new data', function (done) {
    var data = {};
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            e.errors.should.have.property('ne');
            e.errors.should.have.property('conversionRatio');
            done();
        })
});
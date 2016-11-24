var helper = require("../helper");
var UsterManager = require("../../src/managers/master/uster-manager");
var ProductUtil = require('../data-util/master/product-data-util');
var UsterClassification = require('dl-models').master.UsterClassification;
var Uster = require('dl-models').master.Uster;
var validator = require('dl-models').validator.master;
var CodeGenerator = require('../../src/utils/code-generator');
var instanceManager = null;
require("should");

function getData() {
    return Promise.resolve(ProductUtil.getTestData())
        .then(product => {
            var uster = new Uster();

            uster.product = product;
            uster.productId = product._id;
            uster.classifications = [];

            var Excellent  = new UsterClassification();
            Excellent.thin = 5;
            Excellent.thick = 10;
            Excellent.neps = 15;
            Excellent.grade = "Excellent";
            uster.classifications.push(Excellent)
            var Good  = new UsterClassification();
            Good.thin = 10;
            Good.thick = 20;
            Good.neps = 30;
            Good.grade = "Good";
            uster.classifications.push(Good)
            var Medium  = new UsterClassification();
            Medium.thin = 15;
            Medium.thick = 30;
            Medium.neps = 45;
            Medium.grade = "Medium";
            uster.classifications.push(Medium)
            var Low  = new UsterClassification();
            Low.thin = 20;
            Low.thick = 40;
            Low.neps = 60;
            Low.grade = "Low";
            uster.classifications.push(Low)
            var Bad  = new UsterClassification();
            Bad.thin = 25;
            Bad.thick = 50;
            Bad.neps = 75;
            Bad.grade = "Bad";
            uster.classifications.push(Bad)

            return uster;
        });
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new UsterManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#01. should success when read data', function (done) {
    instanceManager.read()
        .then(documents => {
            //process documents
            documents.data.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var usterId;
it('#02. should success when create new data', function (done) {
    getData().then(data => {
        instanceManager.create(data)
            .then(id => {
                id.should.be.Object();
                usterId = id;
                done();
            })
            .catch(e => {
                done(e);
            })
	})
    .catch(e => {
        done(e);
    })
});

var usterData;
it(`#03. should success when get created data product with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: usterId })
        .then(data => {
            validator.uster(data);
            data.should.instanceof(Object);
            usterData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#04. should error when create new data with same product', function (done) {
    getData().then(data => {
        data.product = usterData.product;
        data.productId = usterData.productId;
        instanceManager.create(data)
            .then(id => {
                id.should.be.Object();
                done("Should not be able to create data with same product");
            })
            .catch(e => {
                e.errors.should.have.property('product');
                done();
            })
	})
    .catch(e => {
        done(e);
    })
});

it('#05. should error when create new data with no data classification', function (done) {
    getData().then(data => {
        data.classifications = [];
        instanceManager.create(data)
            .then(id => {
                id.should.be.Object();
                done("Should not be able to create data with no data classification");
            })
            .catch(e => {
                e.errors.should.have.property('classifications');
                done();
            })
	})
    .catch(e => {
        done(e);
    })
});

it('#06. should error when create new data with no data product', function (done) {
    getData().then(data => {
        data.product = {};
        data.productId = {};
        instanceManager.create(data)
            .then(id => {
                id.should.be.Object();
                done("Should not be able to create data with no data classification");
            })
            .catch(e => {
                e.errors.should.have.property('product');
                done();
            })
	})
    .catch(e => {
        done(e);
    })
});

it(`#07. should success when update created data`, function (done) {
    ProductUtil.getTestData().then(data => {
        usterData.product = data;
        usterData.productId = data._id;
        var newClassification = [];
        for(var a of usterData.classifications){
            a.thin += 1;
            a.thick += 1;
            a.neps += 1;
            a.grade += ' [updated]';
            newClassification.push(a);
        }
        usterData.classifications = newClassification;
        instanceManager.update(usterData)
            .then(id => {
                usterId.toString().should.equal(id.toString());
                done();
            })
            .catch(e => {
                done(e);
            });
	})
    .catch(e => {
        done(e);
    })
});

it(`#08. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: usterId })
        .then(data => {
            validator.uster(data);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#09. should success when delete data`, function (done) {
    instanceManager.delete(usterData)
        .then(id => {
            usterId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#10. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: usterId })
        .then(data => {
            validator.uster(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

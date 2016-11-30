var helper = require("../helper");
var ThreadSpecificationManager = require("../../src/managers/master/thread-specification-manager");
var ProductManager = require("../../src/managers/master/product-manager");
var UomUtil = require('../data-util/master/uom-data-util');
var Product = require('dl-models').master.Product;
var validator = require('dl-models').validator.master;
var instanceManager = null;
var instanceManagerProduct = null;
require("should");

function getDataProduct(){
    return Promise.resolve(UomUtil.getTestData())
        .then(uom => {
            var Product = require('dl-models').master.Product;
            var now = new Date();
            var stamp = now / 1000 | 0;
            var code = stamp.toString(36);

            var product = new Product();
            product.code = code;
            product.name = `name[${code}]`;
            product.price = 50;
            product.description = `description for ${code}`;
            product.tags = `Benang Spinning ${code}`;
            product.properties = [];
            product.uom = uom;
            product.uomId = uom._id;

            return product;
        });
}

function getData() {
            var ThreadSpecification = require('dl-models').master.ThreadSpecification;
            var threadSpecification = new ThreadSpecification();

            var now = new Date();
            var stamp = now / 1000 | 0;
            var code = stamp.toString(36);
            
            threadSpecification.rpm = 100;
            threadSpecification.spindle = 150;
            threadSpecification.tpi = 15;

            return threadSpecification;
}

function getNewData() {
    var ThreadSpecification = require('dl-models').master.ThreadSpecification;
    var threadSpecification = new ThreadSpecification();
    
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);
    
    threadSpecification.threadName = product.name;
    threadSpecification.productId = product._id;
    threadSpecification.product = product;
    threadSpecification.rpm = 100;
    threadSpecification.spindle = 150;
    threadSpecification.tpi = 15;
    return threadSpecification;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new ThreadSpecificationManager(db, {
                username: 'unit-test'
            });
            instanceManagerProduct = new ProductManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

var productId;
it('#01. should success when create new data product', function (done) {
    getDataProduct().then(data => {
        instanceManagerProduct.create(data)
            .then(id => {
                id.should.be.Object();
                productId = id;
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

var product;
it(`#02. should success when get created data product with id`, function (done) {
    instanceManagerProduct.getSingleByQuery({ _id: productId })
        .then(data => {
            validator.product(data);
            data.should.instanceof(Object);
            product = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#03. should success when read data', function (done) {
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

var createdId;
it('#04. should success when create new data thread specification', function (done) {
    var data = getData();
    data.product = product;
    data.productId = product._id;
    data.threadName = product.name;
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        });
});

var createdData;
it(`#05. should success when get created data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.threadSpecification(data);
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#06. should success when update created data`, function (done) {

    createdData.rpm += 1;
    createdData.tpi += 1;
    createdData.spindle += 1;

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#07. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.threadSpecification(data);
            data.rpm.should.equal(createdData.rpm);
            data.spindle.should.equal(createdData.spindle);
            data.tpi.should.equal(createdData.tpi);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#08. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#19. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.threadSpecification(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var helper = require("../helper");
var LotMachineManager = require("../../src/managers/master/lot-machine-manager");
var ProductManager = require("../../src/managers/master/product-manager");
var MachineManager = require("../../src/managers/master/machine-manager");
var UomUtil = require('../data-util/master/uom-data-util');
var Product = require('dl-models').master.Product;
var Machine = require('dl-models').master.Machine;
var UnitUtil = require('../data-util/master/unit-data-util');
var validator = require('dl-models').validator.master;
var instanceManager = null;
var instanceManagerProduct = null;
var instanceManagerMachine = null;
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

function getDataMachine() {
    return Promise.resolve(UnitUtil.getTestData())
        .then(unit => {
            var Machine = require('dl-models').master.Machine;
            var machine = new Machine();

            var now = new Date();
            var stamp = now / 1000 | 0;
            var code = stamp.toString(36);

            machine.name = `name [${code}]`;
            machine.unitId = unit._id;
            machine.unit = unit;
            machine.process = `subdivision [${code}]`;
            machine.manufacture=`manufacture [${code}]`;
            machine.year = now.getFullYear();
            machine.condition=`condition [${code}]`;

            return machine;
        });
}

function getData() {
            var LotMachine = require('dl-models').master.LotMachine;
            var lotMachine = new LotMachine();

            var now = new Date();
            var stamp = now / 1000 | 0;
            var code = stamp.toString(36);
            
            lotMachine.rpm = 100;
            lotMachine.ne = 150;
            lotMachine.constant = 15;
            lotMachine.lot=`lot [${code}]`;

            return lotMachine;
}

function getNewData() {
    var LotMachine = require('dl-models').master.LotMachine;
    var lotMachine = new LotMachine();
    
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);
    
    lotMachine.productId = product._id;
    lotMachine.product = product;
    lotMachine.machineId = machine._id;
    lotMachine.machine = machine;
    lotMachine.rpm = 100;
    lotMachine.ne = 150;
    lotMachine.constant = 15;
    lotMachine.lot=`lot [${code}]`;
    return lotMachine;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new LotMachineManager(db, {
                username: 'unit-test'
            });
            instanceManagerProduct = new ProductManager(db, {
                username: 'unit-test'
            });
            instanceManagerMachine = new MachineManager(db, {
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
var machineId;

it('#04. should success when create new data machine', function (done) {
    getDataMachine().then(data => {
        instanceManagerMachine.create(data)
            .then(id => {
                id.should.be.Object();
                machineId = id;
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
var machine;
it(`#05. should success when get created data machine with id`, function (done) {
    instanceManagerMachine.getSingleByQuery({ _id: machineId })
        .then(data => {
            validator.machine(data);
            data.should.instanceof(Object);
            machine = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});
it('#06. should success when create new data lot machine', function (done) {
    var data = getData();
    data.product = product;
    data.productId = product._id;
    data.threadName = product.name;
    data.machine = machine;
    data.machineId = machine._id;
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
it(`#07. should success when get created data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.lotMachine(data);
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#08. should success when update created data`, function (done) {

    createdData.rpm += 1;
    createdData.ne += 1;
    createdData.constant += 1;

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#09. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.lotMachine(data);
            data.rpm.should.equal(createdData.rpm);
            data.ne.should.equal(createdData.ne);
            data.constant.should.equal(createdData.constant);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#10. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#11. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.lotMachine(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});

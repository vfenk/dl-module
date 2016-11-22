'use strict';

var should = require('should');
var helper = require("../../../helper");
var assert = require('assert');
var validator = require('dl-models').validator.production;
var validatorMaster = require('dl-models').validator.master;
var WindingProductionOutputManager = require("../../../../src/managers/production/spinning/winding/winding-production-output-manager");
var MachineManager = require("../../../../src/managers/master/machine-manager");
var ProductManager = require("../../../../src/managers/master/product-manager");
var LotMachineManager = require("../../../../src/managers/master/lot-machine-manager");
var ThreadSpecificationManager = require("../../../../src/managers/master/thread-specification-manager");
var UomUtil = require('../../../data-util/master/uom-data-util');
var UnitUtil = require('../../../data-util/master/unit-data-util');
var instanceManager = null;
var instanceManagerMachine = null;
var instanceManagerProduct = null;
var instanceManagerLotMachine = null;
var instanceManagerThreadSpecification = null;
var Machine = require('dl-models').master.Machine;
var ThreadSpecification = require('dl-models').master.ThreadSpecification;
var LotMachine = require('dl-models').master.LotMachine;
var Product = require('dl-models').master.Product;

function getData() {
    var WindingProductionOutput = require('dl-models').production.spinning.winding.WindingProductionOutput;
    var windingProductionOutput = new WindingProductionOutput();

    var now = new Date();

    windingProductionOutput.spinning = 'SPINNING 1';
    windingProductionOutput.date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    windingProductionOutput.shift = 'Shift 1';
    windingProductionOutput.threadWeight = 1.89;
    windingProductionOutput.goodCone = 5;
    windingProductionOutput.badCone = 5;
    windingProductionOutput.drum = 10;

    return windingProductionOutput;
}

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

function getLotMachineData() {
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

function getThreadSpecificationData() {
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

function getDataMachine() {
    return Promise.resolve(UnitUtil.getTestData())
        .then(unit => {
            var Machine = require('dl-models').master.Machine;
            var machine = new Machine();

            var now = new Date();
            var stamp = now / 1000 | 0;
            var code = stamp.toString(36);

            machine.name = `name [${code}]`;
            machine.unit = unit;
            machine.unitId = unit._id;
            machine.process = `process [${code}]`;
            machine.manufacture=`manufacture [${code}]`;
            machine.year = now.getFullYear();
            machine.machineCondition=`machine condition [${code}]`;

            return machine;
        });
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new WindingProductionOutputManager(db, {
                username: 'unit-test'
            });
            instanceManagerMachine = new MachineManager(db, {
                username: 'unit-test'
            });
            instanceManagerLotMachine = new LotMachineManager(db, {
                username: 'unit-test'
            });
            instanceManagerThreadSpecification= new ThreadSpecificationManager(db, {
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
            validatorMaster.product(data);
            data.should.instanceof(Object);
            product = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var machineId;
it('#03. should success when create new data Machine', function (done) {
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
it(`#04. should success when get created data Machine with id`, function (done) {
    instanceManagerMachine.getSingleByQuery({ _id: machineId })
        .then(data => {
            validatorMaster.machine(data);
            data.should.instanceof(Object);
            machine = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var lotMachineId;
it('#05. should success when create new data Lot Machine', function (done) {
    var data =getLotMachineData();
    data.productId = product._id;
    data.product = product;
    data.machineId = machine._id;
    data.machine = machine;
        instanceManagerLotMachine.create(data)
            .then(id => {
                id.should.be.Object();
                lotMachineId = id;
                done();
            })
            .catch(e => {
            done(e);
            })
});

var lotMachine;
it(`#06. should success when get created data Lot Machine with id`, function (done) {
    instanceManagerLotMachine.getSingleByQuery({ _id: lotMachineId })
        .then(data => {
            validatorMaster.lotMachine(data);
            data.should.instanceof(Object);
            lotMachine = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var threadSpecificationId;
it('#07. should success when create new data threadSpecification', function (done) {
    var data =getThreadSpecificationData();
    data.productId = product._id;
    data.product = product;
        instanceManagerThreadSpecification.create(data)
            .then(id => {
                id.should.be.Object();
                threadSpecificationId = id;
                done();
            })
            .catch(e => {
            done(e);
            })
});

var threadSpecification;
it(`#08. should success when get created data threadSpecification with id`, function (done) {
    instanceManagerThreadSpecification.getSingleByQuery({ _id: threadSpecificationId })
        .then(data => {
            validatorMaster.threadSpecification(data);
            data.should.instanceof(Object);
            threadSpecification = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#09. should success when read data', function (done) {
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
it('#10. should success when create new data', function (done) {
    var data = getData();
    data.machine = machine;
    data.machineId = machine._id;
    data.lotMachine = lotMachine;
    data.lotMachineId = lotMachine._id;
    data.threadSpecification = threadSpecification;
    data.threadSpecificationId = threadSpecification._id;
    data.product = product;
    data.productId = product._id;
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

var createdData;
it(`#11. should success when get created data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#12. should success when update created data`, function (done) {
    
    var newDate = new Date();
    newDate.setDate(newDate.getDate() + (-1));

    createdData.spinning += ' [updated]';
    createdData.date = newDate;
    createdData.threadWeight += 1;
    createdData.goodCone += 1;
    createdData.badCone += 1;
    createdData.drum += 1;
    createdData.shift += 'Shift 2';

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});


it(`#13. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.spinning.winding.windingProductionOutput(data);
            data.spinning.should.equal(createdData.spinning);
            data.shift.should.equal(createdData.shift);
            data.threadWeight.should.equal(createdData.threadWeight);
            data.goodCone.should.equal(createdData.goodCone);
            data.badCone.should.equal(createdData.badCone);
            data.drum.should.equal(createdData.drum);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#14. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#15. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            validator.spinning.winding.windingProductionOutput(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});
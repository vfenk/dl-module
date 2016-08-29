'use strict';

var should = require('should');
var helper = require("../helper");
var POGarmentJobOrderAccessoriesManager = require("../../src/managers/po/po-garment-job-order-accessories-manager");
var instanceManager = null;

function getData() {
    var POGarmentJobOrderAccessories = require('dl-models').po.POGarmentJobOrderAccessories;
    var Supplier = require('dl-models').core.Supplier;
    var Buyer = require('dl-models').core.Buyer;
    var UoM_Template = require('dl-models').core.UoM_Template;
    var UoM = require('dl-models').core.UoM;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var poGarmentJobOrderAccessories = new POGarmentJobOrderAccessories();
    poGarmentJobOrderAccessories.RONo = '1' + code + stamp;
    poGarmentJobOrderAccessories.RefPONo = '2' + code + stamp;
    poGarmentJobOrderAccessories.PRNo = '3' + code + stamp;
    poGarmentJobOrderAccessories.PONo = '3' + code + stamp;
    poGarmentJobOrderAccessories.ppn = 10;
    poGarmentJobOrderAccessories.deliveryDate = new Date();
    poGarmentJobOrderAccessories.termOfPayment = 'Tempo 2 bulan';
    poGarmentJobOrderAccessories.deliveryFeeByBuyer = true;
    poGarmentJobOrderAccessories.PODLNo = '';
    poGarmentJobOrderAccessories.description = 'SP1';
    poGarmentJobOrderAccessories.supplierID = {};
    poGarmentJobOrderAccessories.buyerID = {};
    poGarmentJobOrderAccessories.article = "Test Article";

    var supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC:'Suppy',
        address: 'test',
        import: true
    });

    var buyer = new Buyer({
        code: '123',
        name: 'Buyer01',
        contact: '0812....',
        address: 'test',
        tempo: 0
    });

    var template = new UoM_Template({
        mainUnit: 'M',
        mainValue: 1,
        convertedUnit: 'M',
        convertedValue: 1
    });

    var _units = [];
    _units.push(template);

    var _uom = new UoM({
        category: 'UoM-Unit-Test',
        default: template,
        units: _units
    });


    var product = new Product({
        code: '22',
        name: 'hotline',
        price: 0,
        description: 'hotline123',
        UoM: _uom,
        detail: {}
    });

    var productValue = new PurchaseOrderItem({
        qty: 0,
        price: 0,
        product: product
    });

    var _products = [];
    _products.push(productValue);

    poGarmentJobOrderAccessories.supplier = supplier;
    poGarmentJobOrderAccessories.buyer = buyer;
    poGarmentJobOrderAccessories.items = _products;
    return poGarmentJobOrderAccessories;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new POGarmentJobOrderAccessoriesManager(db, {
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
            documents.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#02. should success when read all podl data', function (done) {
    instanceManager.readAllPurchaseOrderGroup()
        .then(documents => {
            //process documents
            documents.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#03. should success when create new data', function (done) {
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

var createdPODLId;
it('#04. should success when create podl data', function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(result => {
            var _poNumbers = []
            _poNumbers.push(result.PONo)
            instanceManager.createGroup(_poNumbers)
                .then(id => {
                    id.should.be.Object();
                    createdPODLId = id;
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

var createdData;
it(`#05. should success when get created data with id`, function (done) {
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

it(`#06. should success when update created data`, function (done) {
    createdData.RONo += '[updated]';
    createdData.PRNo += '[updated]';
    createdData.PONo += '[updated]';
    createdData.RefPONo += '[updated]';
    createdData.termOfPayment += '[updated]';
    createdData.PODLNo += '[updated]';
    createdData.description += '[updated]';

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
            data.RONo.should.equal(createdData.RONo);
            data.PRNo.should.equal(createdData.PRNo);
            data.PONo.should.equal(createdData.PONo);
            data.RefPONo.should.equal(createdData.RefPONo);
            data.termOfPayment.should.equal(createdData.termOfPayment);
            data.PODLNo.should.equal(createdData.PODLNo);
            data.description.should.equal(createdData.description);

            done();
        })
        .catch(e => {
            done(e);
        })
});


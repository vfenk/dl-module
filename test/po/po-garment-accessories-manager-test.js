'use strict';

var should = require('should');
var helper = require("../helper");
var POGarmentAccessoriesManager = require("../../src/managers/po/po-garment-accessories-manager");
var instanceManager = null;

function getData() {
    var POGarmentAccessories = require('dl-models').po.POGarmentAccessories;
    var Buyer = require('dl-models').core.Buyer;
    var UoM = require('dl-models').core.UoM;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;
    
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var pOGarmentAccessories = new POGarmentAccessories();
    pOGarmentAccessories.RONo = '1' + code + stamp;
    pOGarmentAccessories.PRNo = '2' + code + stamp;
    pOGarmentAccessories.RefPONo = '3' + code + stamp;
    pOGarmentAccessories.article = "Test Article";
    pOGarmentAccessories.PODLNo = '';
    pOGarmentAccessories.buyerId = {};

    var buyer = new Buyer({
        _id: '123',
        code: '123',
        name: 'Buyer01',
        contact: '0812....',
        address: 'test',
        tempo: 0
    });

    var _uom = new UoM({
        unit: `Meter`
    });

    var product = new Product('accessories', {
        code: '22',
        name: 'hotline',
        price: 0,
        description: 'hotline123',
        UoM: _uom,
        detail: {}
    });

    var productValue = new PurchaseOrderItem({
        quantity: 2,
        price: 10000,
        description: 'warna merah',
        dealQuantity: 2,
        dealMeasurement: 'Meter',
        defaultQuantity: 200,
        defaultMeasurementQuantity: 'Centimeter',
        product: product
    });

    var _products = [];
    _products.push(productValue);

    pOGarmentAccessories.buyer = buyer;
    pOGarmentAccessories.items = _products;

    return pOGarmentAccessories;
}

function getPODL(poGarmentAccessories) {

    var PurchaseOrderGroup = require('dl-models').po.PurchaseOrderGroup;
    var Supplier = require('dl-models').core.Supplier;

    var poGroupGarmentAccessories = new PurchaseOrderGroup();
    poGroupGarmentAccessories.usePPn = true;
    poGroupGarmentAccessories.usePPh = true;
    poGroupGarmentAccessories.deliveryDate = new Date();
    poGroupGarmentAccessories.termOfPayment = 'Cash';
    poGroupGarmentAccessories.deliveryFeeByBuyer = true;
    poGroupGarmentAccessories.description = 'SP1';
    poGroupGarmentAccessories.currency = 'dollar';
    poGroupGarmentAccessories.paymentDue = 2;
    poGroupGarmentAccessories.supplierId = {};
    poGroupGarmentAccessories.otherTest = 'test test test';

    var _supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC: 'Suppy',
        address: 'test',
        import: true
    });

    var _items = [];
    _items.push(poGarmentAccessories);

    poGroupGarmentAccessories.supplier = _supplier;
    poGroupGarmentAccessories.items = _items;

    return poGroupGarmentAccessories;
}

function updateForSplit(purchaseOrder) {

    var newPurchaseOrder = {};
    newPurchaseOrder.iso = purchaseOrder.iso;
    newPurchaseOrder.RONo = purchaseOrder.RONo;
    newPurchaseOrder.PRNo = purchaseOrder.PRNo;
    newPurchaseOrder.RefPONo = purchaseOrder.PRNo;
    newPurchaseOrder.linkedPONo = purchaseOrder.PONo;
    newPurchaseOrder.article = purchaseOrder.article;
    newPurchaseOrder.buyerId = purchaseOrder.buyerId;
    newPurchaseOrder.buyer = purchaseOrder.buyer;
    newPurchaseOrder.shipmentDate = purchaseOrder.shipmentDate;
    newPurchaseOrder.items = purchaseOrder.items;
    
    for(var item of newPurchaseOrder.items) {
        item.dealQuantity = 1;
        item.defaultQuantity = 10;
    }

    return newPurchaseOrder;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new POGarmentAccessoriesManager(db, {
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

it('#04. should success when split po', function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(result => {
            var data = updateForSplit(result);
            instanceManager.split(data)
                .then(id => {
                    id.should.be.Object();
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

var createdPODLId;
it('#05. should success when create podl data', function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(result => {
            var data = getPODL(result)
            instanceManager.createGroup(data)
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
it(`#06. should success when get created data with id`, function (done) {
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

it(`#07. should success when update created data`, function (done) {
    createdData.RONo += '[updated]';
    createdData.PRNo += '[updated]';
    createdData.PONo += '[updated]';
    createdData.PODLNo += '[updated]';

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#08. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data.RONo.should.equal(createdData.RONo);
            data.PRNo.should.equal(createdData.PRNo);
            data.PONo.should.equal(createdData.PONo);
            data.PODLNo.should.equal(createdData.PODLNo);

            done();
        })
        .catch(e => {
            done(e);
        })
});


'use strict';

var should = require('should');
var helper = require("../helper");
var POTextileManager = require("../../src/managers/po/po-textile-manager");
var instanceManager = null;

function getData() {
    var POTextile = require('dl-models').po.POTextile;
    var Buyer = require('dl-models').core.Buyer;
    var Uom = require('dl-models').core.Uom;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var poTextile = new POTextile();
    poTextile.PRNo = '1' + code + stamp;
    poTextile.RefPONo = '2' + code + stamp;
    poTextile.PODLNo = '';
    poTextile.unit = 'unit';
    poTextile.PRDate = new Date();
    poTextile.category = 'category';
    poTextile.requestDate = new Date();
    poTextile.staffName = 'staff';
    poTextile.receivedDate = new Date();

    var _uom = new Uom({
        unit: `Meter`
    });

    var product = new Product("fabric", {
        code: 'FF0001',
        name: 'kain',
        price: 0,
        description: 'kain putih',
        uom: _uom,
        detail: {}
    });

    var productValue = new PurchaseOrderItem({
        price: 10000,
        description: 'test desc',
        dealQuantity: 10,
        dealMeasurement: 'Meter',
        defaultQuantity: 1000,
        defaultMeasurementQuantity: 'Centimeter',
        product: product
    });

    var _products = [];
    _products.push(productValue);

    poTextile.items = _products;

    return poTextile;
}

function updateForSplit(purchaseOrder) {

    var newPurchaseOrder = {};
    newPurchaseOrder.iso = purchaseOrder.iso;
    newPurchaseOrder.PRNo = purchaseOrder.PRNo;
    newPurchaseOrder.RefPONo = purchaseOrder.PRNo;
    newPurchaseOrder.linkedPONo = purchaseOrder.PONo;
    newPurchaseOrder.PODLNo = purchaseOrder.PODLNo;
    newPurchaseOrder.unit = purchaseOrder.unit;
    newPurchaseOrder.PRDate = purchaseOrder.PRDate;
    newPurchaseOrder.category = purchaseOrder.category;
    newPurchaseOrder.rate = purchaseOrder.rate;
    newPurchaseOrder.requestDate = purchaseOrder.requestDate;
    newPurchaseOrder.staffName = purchaseOrder.staffName;
    newPurchaseOrder.receivedDate = purchaseOrder.receivedDate;
    newPurchaseOrder.items = purchaseOrder.items;

    for (var item of newPurchaseOrder.items) {
        item.dealQuantity = 1;
        item.defaultQuantity = 10;
    }

    return newPurchaseOrder;
}

function getPODL(poTextile) {

    var PurchaseOrderGroup = require('dl-models').po.PurchaseOrderGroup;
    var Supplier = require('dl-models').core.Supplier;
    var StandardQualityTestPercentage = require('dl-models').po.StandardQualityTestPercentage;

    var poGroupTextile = new PurchaseOrderGroup();
    poGroupTextile.usePPn = true;
    poGroupTextile.usePPh = true;
    poGroupTextile.deliveryDate = new Date();
    poGroupTextile.termOfPayment = 'Cash';
    poGroupTextile.deliveryFeeByBuyer = true;
    poGroupTextile.description = 'SP1';
    poGroupTextile.currency = 'dollar';
    poGroupTextile.rate = 100;
    poGroupTextile.paymentDue = 2;
    poGroupTextile.supplierId = {};
    poGroupTextile.otherTest = 'test test test';

    var _supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC: 'Suppy',
        address: 'test',
        import: true
    });

    var _items = [];
    _items.push(poTextile);

    poGroupTextile.supplier = _supplier;
    poGroupTextile.items = _items;

    return poGroupTextile;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new POTextileManager(db, {
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
    createdData.unit += '[updated]';

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
            data.RefPONo.should.equal(createdData.RefPONo);
            data.PONo.should.equal(createdData.PONo);
            data.PODLNo.should.equal(createdData.PODLNo);

            done();
        })
        .catch(e => {
            done(e);
        })
});

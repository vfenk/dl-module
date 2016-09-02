'use strict';

var should = require('should');
var helper = require("../helper");
var POGarmentJobOrderFabricManager = require("../../src/managers/po/po-garment-job-order-fabric-manager");
var instanceManager = null;

function getData() {
    var POGarmentJobOrderFabric = require('dl-models').po.POGarmentJobOrderFabric;
    var Buyer = require('dl-models').core.Buyer;
    var UoM = require('dl-models').core.UoM;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var poGarmentJobOrderFabric = new POGarmentJobOrderFabric();
    poGarmentJobOrderFabric.RONo = '1' + code + stamp;
    poGarmentJobOrderFabric.PRNo = '2' + code + stamp;
    poGarmentJobOrderFabric.RefPONo = '3' + code + stamp;
    poGarmentJobOrderFabric.article = "Test Article";
    poGarmentJobOrderFabric.PODLNo = '';
    poGarmentJobOrderFabric.buyerId = {};

    var buyer = new Buyer({
        _id: '123',
        name: `Buyer [${code}]`,
        address: `Solo [${code}]`,
        contact: `phone[${code}]`,
        tempo: 0
    });

    var _uom = new UoM({
        unit: `Meter`
    });

    var product = new Product("fabric", {
        code: 'FF0001',
        name: 'kain',
        price: 0,
        description: 'kain putih',
        UoM: _uom,
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

    poGarmentJobOrderFabric.buyer = buyer;
    poGarmentJobOrderFabric.items = _products;

    return poGarmentJobOrderFabric;
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

function getPODL(poJobOrderFabric) {

    var PurchaseOrderGroup = require('dl-models').po.PurchaseOrderGroup;
    var Supplier = require('dl-models').core.Supplier;
    var StandardQualityTestPercentage = require('dl-models').po.StandardQualityTestPercentage;

    var poGroupGarmentJobOrderFabric = new PurchaseOrderGroup();
    poGroupGarmentJobOrderFabric.usePPn = true;
    poGroupGarmentJobOrderFabric.usePPh = true;
    poGroupGarmentJobOrderFabric.deliveryDate = new Date();
    poGroupGarmentJobOrderFabric.termOfPayment = 'Cash';
    poGroupGarmentJobOrderFabric.deliveryFeeByBuyer = true;
    poGroupGarmentJobOrderFabric.description = 'SP1';
    poGroupGarmentJobOrderFabric.currency = 'dollar';
    poGroupGarmentJobOrderFabric.paymentDue = 2;
    poGroupGarmentJobOrderFabric.supplierId = {};
    poGroupGarmentJobOrderFabric.otherTest = 'test test test';

    var _supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC: 'Suppy',
        address: 'test',
        import: true
    });

    var _items = [];
    _items.push(poJobOrderFabric);

    var _stdQtyTest = new StandardQualityTestPercentage({
        shrinkage: 10,
        wetRubbing: 20,
        dryRubbing: 30,
        washing: 40,
        darkPrespiration: 50,
        lightMedPrespiration: 60,
    })

    poGroupGarmentJobOrderFabric.supplier = _supplier;
    poGroupGarmentJobOrderFabric.items = _items;
    poGroupGarmentJobOrderFabric.standardQuality = _stdQtyTest;

    return poGroupGarmentJobOrderFabric;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new POGarmentJobOrderFabricManager(db, {
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
            data.RefPONo.should.equal(createdData.RefPONo);
            data.PONo.should.equal(createdData.PONo);
            data.PODLNo.should.equal(createdData.PODLNo);

            done();
        })
        .catch(e => {
            done(e);
        })
});

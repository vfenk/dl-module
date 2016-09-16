'use strict';

var should = require('should');
var helper = require("../helper");
var PurchaseOrderBaseManager = require("../../src/managers/po/purchase-order-base-manager");
var instanceManager = null;

function getData() {
    var PurchaseOrder = require('dl-models').po.PurchaseOrder;
    var Buyer = require('dl-models').core.Buyer;
    var Uom = require('dl-models').core.Uom;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var purchaseOrder = new PurchaseOrder();
    purchaseOrder.PRNo = '1' + code + stamp;
    purchaseOrder.RefPONo = '2' + code + stamp;
    purchaseOrder.PODLNo = '';
    purchaseOrder.unit = 'unit';
    purchaseOrder.PRDate = new Date();
    purchaseOrder.category = 'category';
    purchaseOrder.requestDate = new Date();
    purchaseOrder.staffName = 'staff';
    purchaseOrder.receivedDate = new Date();

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

    purchaseOrder.items = _products;

    return purchaseOrder;
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

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new PurchaseOrderBaseManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#01. should success when read data', function (done) {
    instanceManager.read('unit','category')
        .then(documents => {
            documents.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#02. should success when create new data', function (done) {
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

it('#03. should success when split po', function (done) {
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

var createdData;
it(`#04. should success when get created data with id`, function (done) {
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

it(`#05. should success when update created data`, function (done) {
    createdData.staffName += '[updated]';
    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should success when get updated data with id`, function (done) {
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

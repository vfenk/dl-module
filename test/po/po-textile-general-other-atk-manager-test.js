'use strict';

var should = require('should');
var helper = require("../helper");
var POTextileGeneralOtherATKManager = require("../../src/managers/po/po-textile-general-other-atk-manager");
var instanceManager = null;

function getData() {
    var POTekstilGeneralOtherATK = require('dl-models').po.POTekstilGeneralOtherATK;
    var Uom = require('dl-models').core.Uom;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var poTextileGeneralOtherATK = new POTekstilGeneralOtherATK();
    poTextileGeneralOtherATK.PRNo = '1' + code + stamp;
    poTextileGeneralOtherATK.RefPONo = '2' + code + stamp;
    poTextileGeneralOtherATK.PODLNo = '';

    var _uom = new Uom({
        unit: `Meter`
    });

    var product = new Product({
        code: '22',
        name: 'hotline',
        price: 0,
        description: 'hotline123',
        uom: _uom,
        detail: {}
    });

    var productValue = new PurchaseOrderItem({
        quantity: 10,
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

    poTextileGeneralOtherATK.items = _products;

    return poTextileGeneralOtherATK;
}

function getPODL(poTextileGeneralOtherATK) {

    var PurchaseOrderGroup = require('dl-models').po.PurchaseOrderGroup;
    var Supplier = require('dl-models').core.Supplier;

    var poGroupTextileGeneralOtherATK = new PurchaseOrderGroup();
    poGroupTextileGeneralOtherATK.usePPn = true;
    poGroupTextileGeneralOtherATK.usePPh = true;
    poGroupTextileGeneralOtherATK.deliveryDate = new Date();
    poGroupTextileGeneralOtherATK.termOfPayment = 'Cash';
    poGroupTextileGeneralOtherATK.deliveryFeeByBuyer = true;
    poGroupTextileGeneralOtherATK.description = 'SP1';
    poGroupTextileGeneralOtherATK.currency = 'dollar';
    poGroupTextileGeneralOtherATK.paymentDue = 2;
    poGroupTextileGeneralOtherATK.supplierId = {};

    var _supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC: 'Suppy',
        address: 'test',
        import: true
    });

    var _items = [];
    _items.push(poTextileGeneralOtherATK);

    poGroupTextileGeneralOtherATK.supplier = _supplier;
    poGroupTextileGeneralOtherATK.items = _items;

    return poGroupTextileGeneralOtherATK;
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
            instanceManager = new POTextileGeneralOtherATKManager(db, {
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
    createdData.PRNo += '[updated]';

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
            data.PRNo.should.equal(createdData.PRNo);
            data.RefPONo.should.equal(createdData.RefPONo);
            data.PONo.should.equal(createdData.PONo);
            data.PODLNo.should.equal(createdData.PODLNo);

            done();
        })
        .catch(e => {
            done(e);
        })
});
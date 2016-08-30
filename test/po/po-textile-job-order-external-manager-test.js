'use strict';

var should = require('should');
var helper = require("../helper");
var POTextileJobOrderManager = require("../../src/managers/po/po-textile-job-order-external-manager");
var instanceManager = null;

function getData() {
    var POTextileJobOrder = require('dl-models').po.POTextileJobOrder;
    var Buyer = require('dl-models').core.Buyer;
    var UoM = require('dl-models').core.UoM;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var pOTextileJobOrder = new POTextileJobOrder();
    pOTextileJobOrder.PRNo = '1' + code + stamp;
    pOTextileJobOrder.RefPONo = '2' + code + stamp;
    pOTextileJobOrder.PODLNo = '';
    pOTextileJobOrder.buyerID = {};
    pOTextileJobOrder.article = "Test Article";

    var _buyer = new Buyer({
        _id: '123',
        code: '123',
        name: 'hot',
        description: 'hotline',
        contact: '0812....',
        address: 'test',
        tempo: 'tempo',
        local: true
    });

    var _uom = new UoM({
        unit: `Meter`
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

    pOTextileJobOrder.buyer = _buyer;
    pOTextileJobOrder.items = _products;
    
    return pOTextileJobOrder;
}

function getPODL(pOTextileJobOrder) {

    var PurchaseOrderGroup = require('dl-models').po.PurchaseOrderGroup;
    var Supplier = require('dl-models').core.Supplier;

    var poGroupTextileJobOrder = new PurchaseOrderGroup();
    poGroupTextileJobOrder.usePPn = true;
    poGroupTextileJobOrder.usePPh = true;
    poGroupTextileJobOrder.deliveryDate = new Date();
    poGroupTextileJobOrder.termOfPayment = 'Cash';
    poGroupTextileJobOrder.deliveryFeeByBuyer = true;
    poGroupTextileJobOrder.description = 'SP1';
    poGroupTextileJobOrder.currency = 'dollar';
    poGroupTextileJobOrder.paymentDue = 2;
    poGroupTextileJobOrder.supplierId = {};

    var _supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC: 'Suppy',
        address: 'test',
        import: true
    });

    var _items = [];
    _items.push(pOTextileJobOrder);

    poGroupTextileJobOrder.supplier = _supplier;
    poGroupTextileJobOrder.items = _items;

    return poGroupTextileJobOrder;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new POTextileJobOrderManager(db, {
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
it(`#05. should success when get created data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            // validate.product(data);
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
            data.PODLNo.should.equal(createdData.PODLNo);

            done();
        })
        .catch(e => {
            done(e);
        })
});


// it(`#08. should success when delete data`, function (done) {
//     instanceManager.delete(createdData)
//         .then(id => {
//             createdId.toString().should.equal(id.toString());
//             done();
//         })
//         .catch(e => {
//             done(e);
//         });
// });

// it(`#09. should _deleted=true`, function (done) {
//     instanceManager.getSingleByQuery({ _id: createdId })
//         .then(data => {
//             // validate.product(data);
//             data._deleted.should.be.Boolean();
//             data._deleted.should.equal(true);
//             done();
//         })
//         .catch(e => {
//             done(e);
//         })
// });

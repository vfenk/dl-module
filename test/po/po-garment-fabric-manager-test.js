'use strict';

var should = require('should');
var helper = require("../helper");
var POGarmentFabricManager = require("../../src/managers/po/po-garment-fabric-manager");
var instanceManager = null;

function getData() {
    var POGarmentFabric = require('dl-models').po.POGarmentFabric;
    var Supplier = require('dl-models').core.Supplier;
    var UoM_Template = require('dl-models').core.UoM_Template;
    var UoM = require('dl-models').core.UoM;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;
    var StandardQualityTestPercentage = require('dl-models').po.StandardQualityTestPercentage;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var poGarmentFabric = new POGarmentFabric();
    poGarmentFabric.PRNo = '1' + code + stamp;
    poGarmentFabric.RONo = '2' + code + stamp;
    poGarmentFabric.RefPONo = '3' + code + stamp;
    poGarmentFabric.ppn = 10;
    poGarmentFabric.usePPn = true;
    poGarmentFabric.deliveryDate = new Date();
    poGarmentFabric.termOfPayment = 'Tempo 2 bulan';
    poGarmentFabric.deliveryFeeByBuyer = true;
    poGarmentFabric.PODLNo = '';
    poGarmentFabric.description = 'SP1';
    poGarmentFabric.kurs = 13000;
    poGarmentFabric.currency = 'dollar';
    poGarmentFabric.supplierId = {};
    poGarmentFabric.buyerId = {};

    var supplier = new Supplier({
        _id: '123',
        code: 'TS0001',
        name: 'Toko Kain',
        description: 'toko kain',
        phone: '0812....',
        address: 'jakarta',
        local: true
    });

    var buyer = new Buyer({
        _id: '123',
        name : `name[${code}]`,
        address : `Solo [${code}]`,
        contact : `phone[${code}]`,
        tempo : 0
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
        code: 'FF0001',
        name: 'kain',
        price: 0,
        description: 'kain putih',
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
    
    var _stdQtyTest = new StandardQualityTestPercentage({
        shrinkage : 10,
        wetRubbing : 20,
        dryRubbing : 30,
        washing : 40,
        darkPrespiration : 50,
        lightMedPrespiration : 60,
    })
    
    poGarmentFabric.standardQuality = _stdQtyTest;
    poGarmentFabric.buyer = buyer;
    poGarmentFabric.supplier = supplier;
    poGarmentFabric.items = _products;
    return poGarmentFabric;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new POGarmentFabricManager(db, {
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
    createdData.ReffPONo += '[updated]';
    createdData.termOfPayment += '[updated]';
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
            data.RefPONo.should.equal(createdData.RefPONo);
            data.PONo.should.equal(createdData.PONo);
            data.termOfPayment.should.equal(createdData.termOfPayment);
            data.PODLNo.should.equal(createdData.PODLNo);
            data.description.should.equal(createdData.description);

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

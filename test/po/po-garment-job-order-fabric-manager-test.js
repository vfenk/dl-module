'use strict';

var should = require('should');
var helper = require("../helper");
var POGarmentJobOrderFabricManager = require("../../src/managers/po/po-garment-job-order-fabric-manager");
var instanceManager = null;

function getData() {
    var POGarmentJobOrderFabric = require('dl-models').po.POGarmentJobOrderFabric;
    var Buyer = require('dl-models').core.Buyer;
    var UoM_Template = require('dl-models').core.UoM_Template;
    var UoM = require('dl-models').core.UoM;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;
    var StandardQualityTestPercentage = require('dl-models').po.StandardQualityTestPercentage;

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
        category: `UoM_Unit_Test[${code}]`,
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
    
    poGarmentJobOrderFabric.standardQuality = _stdQtyTest;
    poGarmentJobOrderFabric.buyer = buyer;
    poGarmentJobOrderFabric.items = _products;
    return poGarmentJobOrderFabric;
}

function getPODL(poJobOrderFabric) {
    
    var PurchaseOrderGroup = require('dl-models').po.PurchaseOrderGroup;
    var Supplier = require('dl-models').core.Supplier;
    
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
    
    var _supplier = new Supplier({
        code: '123',
        name: 'Supplier01',
        contact: '0812....',
        PIC:'Suppy',
        address: 'test',
        import: true
    });
    
    var _items = [];
    _items.push(poJobOrderFabric);
    
    poGroupGarmentJobOrderFabric.supplier = _supplier;
    poGroupGarmentJobOrderFabric.items = _items;
    
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

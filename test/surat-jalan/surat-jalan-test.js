var helper = require("../helper");
var SuratJalanManager = require("../../src/managers/surat-jalan/surat-jalan-manager");
var instanceManager = null;

require("should");

function getData() {
    var PurchaseOrder = require('dl-models').po.PurchaseOrder;
    var PurchaseOrderItem = require('dl-models').po.PurchaseOrderItem;
    var Product = require('dl-models').core.Product;
    var Supplier = require('dl-models').core.Supplier;
    var UoM = require('dl-models').core.UoM;
    var SuratJalan = require('dl-models').suratJalan.SuratJalan;
    
    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var _uom = new UoM({
        unit: `Meter`
    });


    var _product = new Product('accessories',{
        code: code,
        name: `name[${code}]`,
        price: 1000,
        description: `desc for ${code}`,
        UoM: _uom
    });

    var purchaseOrderItem = new PurchaseOrderItem({
        price: 10000,
        description: 'test desc',
        dealQuantity: 10,
        dealMeasurement: 'Meter',
        defaultQuantity: 1000,
        defaultMeasurement: 'Centimeter',
        realizationQuantity: 1000,
        product: _product
    });

    var _purchaseOrderItems = [];
    _purchaseOrderItems.push(purchaseOrderItem);

    var purchaseOrder = new PurchaseOrder({
        PONo : `1 [${code}]`,
        RefPONo : `2 [${code}]`,
        RONo : `3 [${code}]`,
        PRNo : `4 [${code}]`,
        article : "Test Article",
        supplierId : {},
        currency : "IDR",
        items : _purchaseOrderItems
    });
    
    var _POItems = [];
    _POItems.push(purchaseOrder);
    
    var _supplier = new Supplier({
        code: '123',
        name: 'hot',
        description: 'hotline',
        phone: '0812....',
        address: 'test',
        local: true
    });

    var suratJalan = new SuratJalan();
    suratJalan.RefSJNo='RefSJNo' + code + stamp;
    suratJalan.SJNo='SJNo' + code + stamp;
    suratJalan.SJDate= new Date();
    suratJalan.productArriveDate= new Date();
    suratJalan.supplier=_supplier;
    suratJalan.deliveryNo='Lokal';
    suratJalan.deliveryType='123456789';
    //suratJalan.isPosted=false;
    suratJalan.items=_POItems;
    
    return suratJalan;

}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new SuratJalanManager(db, {
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

var createdData;
it(`#03. should success when get created data with id`, function (done) {
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

it(`#04. should success when update created data`, function (done) {
    createdData.SJNo += '[updated]';
    
    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#05. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data.RefSJNo.should.equal(createdData.RefSJNo);
            data.SJNo.should.equal(createdData.SJNo);
            data.deliveryType.should.equal(createdData.deliveryType);
            data.deliveryNo.should.equal(createdData.deliveryNo);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#06-1. should success when posting created data`, function (done) {
    instanceManager.post(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});
it(`#06-2. should isPosted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data.isPosted.should.be.Boolean();
            data.isPosted.should.equal(true);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#07. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#08. should error when create new data with same code', function (done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done("Should not be able to create data with same code");
        })
        .catch(e => {
            e.errors.should.have.property('SJNo');
            done();
        })
});

it('#09. should error when create blank data ', function (done) {
    instanceManager.create({})
        .then(id => {
            done("Should not be error when create blank data");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('SJNo');
                e.errors.should.have.property('SJDate');
                e.errors.should.have.property('productArriveDate');
                e.errors.should.have.property('supplier');
                e.errors.should.have.property('deliveryType');
                e.errors.should.have.property('items');
                done();
            } catch (ex) {
                done(ex);
            }
        })
});

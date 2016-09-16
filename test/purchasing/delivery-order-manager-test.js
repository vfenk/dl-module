var helper = require("../helper");
var DeliveryOrderManager = require("../../src/managers/purchasing/delivery-order-manager");
var instanceManager = null;

require("should");

function getData() {
    var PurchaseOrder = require('dl-models').purchasing.PurchaseOrder;
    var PurchaseOrderItem = require('dl-models').purchasing.PurchaseOrderItem;
    var Product = require('dl-models').master.Product;
    var Supplier = require('dl-models').master.Supplier;
    var Uom = require('dl-models').master.Uom;
    var DeliveryOrder = require('dl-models').purchasing.DeliveryOrder;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    var _uom = new Uom({
        unit: `Meter`
    });


    var _product = new Product('accessories', {
        code: code,
        name: `name[${code}]`,
        price: 1000,
        description: `desc for ${code}`,
        uom: _uom,
        tags: 'product,master',
        properties: []
    });

    var purchaseOrderItem = new PurchaseOrderItem({
        product: _product,
        defaultQuantity: 10,
        defaultUom: 10,
        dealQuantity: 10,
        dealUom: 10,
        price: 10000,
        realizationQuantity: 10,
        pricePerDealUnit: 10,
        remark: 'remark01',
        fulfillments: []

    });

    var _purchaseOrderItems = [];
    _purchaseOrderItems.push(purchaseOrderItem);

    var purchaseOrder = new PurchaseOrder({
        no: `2 [${code}]`,
        refNo: `2 [${code}]`,
        iso: `3 [${code}]`,

        realizationOrderId: {},
        realizationOrder: {},
        purchaseRequestId: {},
        purchaseRequest: {},
        buyerId: {},
        buyer: '',
        purchaseOrderExternalId: {},
        purchaseOrderExternal: {},
        supplierId: {},
        supplier: _supplier,

        unitId: {},
        unit: {},

        categoryId: {},
        category: {},

        freightCostBy: '',
        currency: '',
        currencyRate: 1,

        paymentMethod: '',
        paymentDueDays: 30,

        useVat: false,
        vatRate: 0,
        useIncomeTax: false,

        date: now,
        expectedDeliveryDate: now,
        actualDeliveryDate: now,

        isPosted: false,
        remark: '',
        items: [],
    });

    var _POItems = [];
    _POItems.push(purchaseOrder);

    var _supplier = new Supplier({
        code: '123',
        name: `[${code}]`,
        address: 'jakarta selatan',
        contact: '0812....',
        PIC: 'hotline',
        import: true
    });

    var deliveryOrder = new DeliveryOrder();
    deliveryOrder.no = '1';
    deliveryOrder.refNo = '2';
    deliveryOrder.date = now;
    deliveryOrder.supplierId = {};
    deliveryOrder.supplier = _supplier;
    deliveryOrder.isPosted = false;
    deliveryOrder.remark = 'remark DO';
    deliveryOrder.items = [];

    deliveryOrder.items = _POItems;

    return deliveryOrder;

}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new DeliveryOrderManager(db, {
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
            data.refNo.should.equal(createdData.refNo);
            data.no.should.equal(createdData.no); 
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
            done();
        })
        .catch(e => {
            e.errors.should.have.property('no');
            done();
        })
});
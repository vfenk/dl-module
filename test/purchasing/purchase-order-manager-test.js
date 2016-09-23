'use strict';

var should = require('should');
var helper = require("../helper");
var assert = require('assert');
var PurchaseOrderBaseManager = require("../../src/managers/purchasing/purchase-order-manager");
var instanceManager = null;

function getData() {
    var PurchaseOrder = require('dl-models').purchasing.PurchaseOrder;
    var Buyer = require('dl-models').master.Buyer;
    var Unit = require('dl-models').master.Unit;
    var Category = require('dl-models').master.Category;
    var Uom = require('dl-models').master.Uom;
    var PurchaseOrderItem = require('dl-models').purchasing.PurchaseOrderItem;
    var Product = require('dl-models').master.Product;

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);
    
    var buyer = new Buyer();
        buyer.code = code;
        buyer.name = `name[${code}]`;
        buyer.address = `Solo [${code}]`;
        buyer.country = `Ireland [${code}]`;
        buyer.contact = `phone[${code}]`;
        buyer.tempo= 0;
    
    var unit = new Unit();
        unit.code = code;
        unit.division = `division[${code}]`;
        unit.subDivision = `subDivision[${code}]`;
        unit.description=`description[${code}]`;
    
    var category = new Category();
        category.code = '';
        category.name = '';
        category.codeRequirement = '';
        
        
    var uom = new Uom({
        unit: `Meter`
    });
    
    var product = new Product();
        product.code = code;
        product.name = `name[${code}]`;
        product.price = 50;
        product.description = `description for ${code}`;
        product.uom = uom;
        product.tags = 'product,master';
        product.properties = [];
    
    var purchaseOrderItem = new PurchaseOrderItem();
        purchaseOrderItem.price= 10000;
        purchaseOrderItem.description= 'test desc';
        purchaseOrderItem.defaultQuantity= 10;
        purchaseOrderItem.defaultUom= 'Meter';
        purchaseOrderItem.dealQuantity= 1000;
        purchaseOrderItem.dealUom= 'Centimeter';
        purchaseOrderItem.product= product;

    var _purchaseOrderItems = [];
    _purchaseOrderItems.push(purchaseOrderItem);
    
    var purchaseOrder = new PurchaseOrder();
        purchaseOrder.refNo = '1' + code + stamp;
        purchaseOrder.buyerId = "id";
        purchaseOrder.buyer = buyer;
        purchaseOrder.unit = unit;
        purchaseOrder.buyerId = "id";
        purchaseOrder.categoryId = category;
        purchaseOrder.freightCostBy = "Pembeli";
        purchaseOrder.date = new Date();
        purchaseOrder.expectedDeliveryDate = new Date();
        purchaseOrder.actualDeliveryDate = new Date();
        purchaseOrder.items = _purchaseOrderItems;
        purchaseOrder.purchaseRequest.no = '1' + code + stamp;
        purchaseOrder.purchaseRequest.date = new Date();

    return purchaseOrder;
}

function updateForSplit(purchaseOrder) {

    var newPurchaseOrder = {};
    newPurchaseOrder.no = purchaseOrder.no;
    newPurchaseOrder.refNo = purchaseOrder.refNo;
    newPurchaseOrder.buyer = purchaseOrder.buyer;
    newPurchaseOrder.unit = purchaseOrder.unit;
    newPurchaseOrder.category = purchaseOrder.category;
    newPurchaseOrder.freightCostBy = purchaseOrder.freightCostBy+"split";
    newPurchaseOrder.expectedDeliveryDate = purchaseOrder.expectedDeliveryDate;
    newPurchaseOrder.actualDeliveryDate = purchaseOrder.actualDeliveryDate;
    newPurchaseOrder.date = purchaseOrder.date;
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

it('#02. should success when read data no purchase order external ', function (done) {
    instanceManager.readNoPurchaseOrderExternal('unit','category')
        .then(documents => {
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
    createdData.freightCostBy += '[updated]';
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
            data.no.should.equal(createdData.no);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#08. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#09. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});
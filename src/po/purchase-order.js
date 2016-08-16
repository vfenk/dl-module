'use strict'
var BaseModel = require('capital-models').BaseModel;
var Supplier = require('../core/supplier');
var Buyer = require('../core/buyer');
var PurchaseOrderItem = require('../po/purchase-order-item');

module.exports = class PurchaseOrder extends BaseModel {
    constructor(type, source) {
        super(type!=''?type:'purchase-order', '1.0.0');

        //Define properties
        this.RONo = '';
        this.article = '';
        this.PRNo = '';
        this.PONo = '';
        this.RefNo = '';
        this.buyerId = {};
        this.buyer = new Buyer();
        this.supplierId = {};
        this.supplier = new Supplier();
        this.ppn = 10;
        this.items = [];
        this.deliveryDate = new Date();
        this.termOfPayment = '';
        this.deliveryFeeByBuyer = false;
        this.PODLNo = '';
        this.description = '';
        this.copy(source);
        
        var _items = [];
        for (var item of this.items) {
            _items.push(new PurchaseOrderItem(item));
        }
        this.items = _items;
    }
}
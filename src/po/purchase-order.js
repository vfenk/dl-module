'use strict'
var BaseModel = require('capital-models').BaseModel;
var Supplier = require('../core/supplier');
var Buyer = require('../core/buyer');
var PurchaseOrderItem = require('../po/purchase-order-item');

module.exports = class PurchaseOrder extends BaseModel {
    constructor(source, type) {
        type = type || 'purchase-order';

        super(type, '1.0.0');

        //Define properties
        this.iso = '';
        this.RONo = '';
        this.PRNo = '';
        this.PONo = '';
        this.RefPONo = '';
        this.article = '';
        this.buyerId = {};
        this.buyer = new Buyer();
        this.PODLNo = '';
        this.items = [];
        this.copy(source);

        var _items = [];
        for (var item of this.items) {
            _items.push(new PurchaseOrderItem(item));
        }
        this.items = _items;
    }
}

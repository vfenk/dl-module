'use strict'
var BaseModel = require('capital-models').BaseModel;
var PurchaseOrder = require('../po/purchase-order');

module.exports = class PurchaseOrderGroup extends BaseModel {
    constructor(source,type) {
        type = type || 'purchase-order-groups';
        
        super(type, '1.0.0');

        //Define properties
        this.PODLNo = '';
        this.supplierId = {};
        this.supplier = new Supplier();
        this.termOfPayment = '';
        this.ppn = 10;
        this.usePPn = false;
        this.usePPh = false;
        this.deliveryDate = new Date();
        this.deliveryFeeByBuyer = false;
        this.paymentDue = 0;
        this.description = '';
        this.currency = '';
        this.items = [];
        
        this.copy(source);
        
        var _items = [];
        for (var item of this.items) {
            _items.push(new PurchaseOrder(item));
        }
        this.items = _items;
    }
}

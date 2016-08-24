'use strict'
var BaseModel = require('capital-models').BaseModel;
var Product = require('../core/product');

module.exports = class PurchaseOrderItem extends BaseModel {
    constructor(source, type) {
        super(type || 'purchase-order-item', '1.0.0');

        this.qty = 0;
        this.price = 0;
        this.product = new Product();
        this.copy(source);
    }
}
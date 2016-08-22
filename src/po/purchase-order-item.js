'use strict'
var BaseModel = require('capital-models').BaseModel;
var Product = require('../core/product');

module.exports = class PurchaseOrderItem {
    constructor(source) {
        this.qty = 0;
        this.price = 0;
        this.product = new Product( );
        // this.copy(source);
    }
}
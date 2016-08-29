'use strict'
var BaseModel = require('capital-models').BaseModel;
var Product = require('../core/product');

module.exports = class PurchaseOrderItem extends BaseModel {
    constructor(source, type) {
        super(type || 'purchase-order-item', '1.0.0');

        this.quantity = 0;
        this.price = 0;
        this.description = '';
        this.dealQuantity = 0;
        this.dealMeasurement = '';
        this.defaultQuantity = 0;
        this.defaultMeasurementQuantity = '';
        this.product = new Product();
        
        this.copy(source);
    }
}
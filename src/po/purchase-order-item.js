'use strict'
var BaseModel = require('capital-models').BaseModel;
var Sparepart = require('../core/sparepart');

module.exports = class PurchaseOrderItem {
    constructor(source) {
        this.qty = 0;
        this.price = 0;
        this.product ={};
        this.copy(source);
    }
}
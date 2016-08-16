'use strict'
var BaseModel = require('capital-models').BaseModel;
var Sparepart = require('../core/sparepart');

module.exports = class PurchaseOrderItem extends BaseModel {
    constructor(source) {
        super('po-item', '1.0.0');
        this.qty = 0;
        this.unit = '';
        this.price = 0;
        this.sparepartId = {};
        this.sparepart = new Sparepart();
        this.copy(source);
    }
}
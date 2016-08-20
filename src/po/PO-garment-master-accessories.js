'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('../map');
module.exports = class POGarmentMasterAccessories extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POGarmentMasterAccessories);
        this.iso = 'FM-6.00-06-005/R1';
    }
}
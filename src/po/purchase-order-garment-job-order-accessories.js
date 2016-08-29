'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('../map');

module.exports = class POGarmentJobOrderAccessories extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POGarmentJobOrderAccessories);
        this.iso = 'FM-6.00-06-005/R1';
        this.otherTest = '';
        
        this.copy(source);
    }
}
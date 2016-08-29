'use strict'
var PurchaseOrder = require('./purchase-order');
var StandardQualityTestPercentage = require('./standard-quality-test-percentage');
var map = require('../map');

module.exports = class POGarmentJobOrderFabric extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POGarmentJobOrderFabric);
        this.iso = 'FM-6.00-06-005/R1';
        this.standardQuality = new StandardQualityTestPercentage();
        this.otherTest = '';
        
        this.copy(source);
    }
}
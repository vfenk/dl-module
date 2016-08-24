'use strict'
var PurchaseOrderGroup = require('./purchase-order-group');
var map = require('../map');
module.exports = class POGroupGarmentFabric extends PurchaseOrderGroup {
    constructor(source) {
        super(source, map.po.type.POGarmentFabric);
    }
}
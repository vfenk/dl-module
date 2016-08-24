'use strict'
var PurchaseOrderGroup = require('./purchase-order-group');
var map = require('../map');
module.exports = class POGroupGarmentSparepart extends PurchaseOrderGroup {
    constructor(source) {
        super(source, map.po.type.POGarmentSparepart);
    }
}
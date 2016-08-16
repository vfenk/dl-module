'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('../map');
module.exports = class POGarmentGeneral extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POGarmentGeneral);
    }
}
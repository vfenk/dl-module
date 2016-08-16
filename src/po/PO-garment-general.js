'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('dl-models').map.po;
module.exports = class POGarmentGeneral extends PurchaseOrder {
    constructor(source) {
        super(source, map.type.POGarmentGeneral);
    }
}
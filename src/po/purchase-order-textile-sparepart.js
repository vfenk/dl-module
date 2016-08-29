'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('../map');

module.exports = class POTextileSparepart extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POTextileSparepart);
        this.iso = 'FM-600-06-005';
    }
}
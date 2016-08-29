'use strict'
var PurchaseOrder = require('./purchase-order');
var map =  require('../map').po;

module.exports = class POTextileJobOrder extends PurchaseOrder {
    constructor(source) {
        super(source, map.type.POTextileJobOrderExternal);
        this.iso = 'FM-600-06-005';
    }
}
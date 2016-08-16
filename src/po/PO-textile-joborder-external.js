'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('dl-models').map.po;
module.exports = class POTextileJobOrder extends PurchaseOrder {
    constructor(source) {
        super(map.type.POTextileJobOrderExternal, source);
    }
}
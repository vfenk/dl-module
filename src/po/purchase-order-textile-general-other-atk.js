'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('../map');

module.exports = class POTekstilGeneralOtherATK extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POTextileGeneralOtherATK);
        this.iso = 'FM-600-06-004';
    }
}
'use strict'
var PurchaseOrder = require('./purchase-order');
var map = require('../map');

module.exports = class POTekstilGeneralATK extends PurchaseOrder {
    constructor(source) {
        super(source, map.po.type.POTextileGeneralATK);
        this.iso = 'FM-600-06-033';
    }
}
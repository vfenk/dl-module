'use strict'
var BaseModel = require('capital-models').BaseModel;
var Supplier = require('../core/supplier');

module.exports = class POGarmentSparepart extends BaseModel {
    constructor(source) {
        super('POGarmentSparepart', '1.0.0');

        //Define properties
        this.RONo = '';
        this.PRNo = '';
        this.PONo = '';
        this.supplierId = {};
        this.supplier = new Supplier();
        this.ppn = 10;
        // this.itemId = {};
        this.items = [];

        this.deliveryDate = new Date();
        this.termOfPayment = '';
        this.deliveryFeeByBuyer = false;
        this.PODLNo = '';
        this.description = '';
        this.copy(source);

        var _items = [];
        for (var item of this.items) {
            _items.push(new SparepartValue(item));
        }
        this.items = _items;
    }
}
'use strict'
var BaseModel = require('capital-models').BaseModel;
var Supplier = require('../core/supplier');
var Buyer = require('../core/buyer');

module.exports = class POGarmentAccessories extends BaseModel {
    constructor(source) {
        super('POGarmentAccessories', '1.0.0');

        //Define properties
        this.RONo = '';
        this.PRNo = '';
        this.PONo = '';
        this.Article = '';
        this.supplierId = {};
        this.supplier = new Supplier();
        this.buyerId = {};
        this.buyer = new Buyer();
        this.deliveryFee = 0;
        this.ppn = 10;
        // this.itemId = {};
        this.items = [];

        this.deliveryDate = new Date();
        this.termOfPayment = '';
        this.PODLNo = '';
        this.description = '';
        this.copy(source);

        var _items = [];
        for (var item of this.items) {
            _items.push(new AccessoriesValue(item));
        }
        this.items = _items;
    }
}
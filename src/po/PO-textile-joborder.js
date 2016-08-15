'use strict'
var BaseModel = require('capital-models').BaseModel;
var Supplier = require('../core/supplier');
var Buyer = require('../core/buyer');

module.exports = class POTextileJobOrder extends BaseModel {
    constructor(source) {
        super('POTextileJobOrder', '1.0.0');

        //Define properties
        this.RONo = '';
        this.PRNo = '';
        this.PONo = '';
        
        this.buyerId = {};
        this.buyer = new Buyer();
        
        this.supplierId = {};
        this.supplier = new Supplier();
        
        this.deliveryFeeByBuyer = false;
        this.termOfPayment = '';
        this.deliveryDate = new Date();
        this.ppn = 10;
        this.description = '';
        this.items = [];
        var _items = [];
        for (var item of this.items) {
            _items.push(new TextileValue(item));
        }
        this.items = _items;
        
        this.PODLNo = '';
        this.copy(source);

        
    }
}
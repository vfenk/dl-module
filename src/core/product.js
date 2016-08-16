'use strict'

var BaseModel = require('capital-models').BaseModel;
var UoM = require('./UoM').UoM;

class ProductDetail{
    constructor(source){
        this.width = source ? source.width : 0;
        this.composition = source ? source.composition : '';
        this.construction = source ? source.construction : '';
        this.yarn = source ? source.yarn : '';
    }
}

module.exports = class Product extends BaseModel{
    constructor(type = 'purchase-order',source)
    {
        super('purchase-order', '1.0.0');

        //Define properties
        this.code ='';
        this.name = '';
        this.price = 0;
        this.description = '';
        this.UoM = new UoM();
        this.detail = new ProductDetail();

        this.copy(source);
    }
}

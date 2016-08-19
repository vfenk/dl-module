'use strict'
var BaseModel = require('capital-models').BaseModel;
var Accessories = require('../core/accessories');

module.exports = class AccessoriesValue extends BaseModel {
    constructor(source) {
        super('AccessoriesValue', '1.0.0');
        this.qty = 0;
        this.unit = '';
        this.price = 0;
        this.accessories = new Accessories();
        this.copy(source);
    }
}
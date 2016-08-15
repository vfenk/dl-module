'use strict'
var BaseModel = require('capital-models').BaseModel;
var Textile = require('../core/textile');

module.exports = class TextileValue extends BaseModel {
    constructor(source) {
        super('TextileValue', '1.0.0');
        this.qty = 0;
        this.unit = '';
        this.price = 0;
        this.textile = new Textile();
        this.copy(source);
    }
}
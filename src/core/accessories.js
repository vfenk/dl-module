'use strict'

var ProductModel = require('./product');
var map = require('../map')

module.exports = class Accessories extends ProductModel{
    constructor(source){
        super(map.core.type.Accessories, source);
    }
}

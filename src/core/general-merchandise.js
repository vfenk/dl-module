'use strict'

var ProductModel = require('./product');
var map = require('../map');

module.exports = class GeneralMerchandise extends ProductModel{
    constructor(source){
        super(map.core.type.GeneralMerchandise, source);
    }
}

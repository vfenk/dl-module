'use strict'

var ProductModel = require('./product');
var map = require('../map');

module.exports = class Textile extends ProductModel{
    constructor(source){
        super(map.core.type.Textile, source);
    }
}

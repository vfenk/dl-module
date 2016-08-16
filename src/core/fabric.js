'use strict'

var ProductModel = require('./product');
var map = require('../map');

module.exports = class Fabric extends ProductModel{
    constructor(source){
        super(map.core.type.Fabric, source);
    }
}
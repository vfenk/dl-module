'use strict'

var ProductModel = require('./product');
var map = require('../map');

module.exports = class Sparepart extends ProductModel{
    constructor(source){
        super(map.core.type.Sparepart, source);
    }
}

'use strict'

var BaseModel = require('capital-models').BaseModel;
var UoM = require('./UoM-docs').UoM;

module.exports = class Fabric extends BaseModel {
    constructor(source) {
        super('fabric', '1.0.0');

        // Define properties.  
        this.code = '';
        this.name = '';
        this.composition = '';
        this.construction = '';
        this.thread = '';
        this.width = 0;
        this.UoM = new UoM();
        this.copy(source);
    }
}
'use strict'

var BaseModel = require("capital-models").BaseModel;
var UoM = require('./UoM-docs').UoM;

module.exports = class Supplier extends BaseModel {
    constructor(source) {
        super('supplier', '1.0.0'); // call MongoModel constructor

        this.code = '';
        this.name = '';
        this.address = '';
        this.contact='';
        this.import = true;
        this.UoM = new UoM();

        this.copy(source);
    }
}
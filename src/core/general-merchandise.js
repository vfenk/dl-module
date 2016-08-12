'use strict'

var BaseModel = require("capital-models").BaseModel;
var UoM = require('./UoM').UoM;

module.exports = class GeneralMerchandise extends BaseModel {
    constructor(source) {
        super('general-merchandise', '1.0.0'); // call MongoModel constructor

        // Define properties
        this.code = '';
        this.name = '';        
        this.description = '';
        this.price=0;
        this.supplier='';
        this.UoM = new UoM();
        
        this.copy(source);
    }
}
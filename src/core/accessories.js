'use strict'

var BaseModel = require('capital-models').BaseModel;
var UoM = require('./UoM').UoM;

module.exports = class Accessories extends BaseModel{
    constructor(source){
        super('accessories', '1.0.0');

        //Define properties
        this.code ='';
        this.name = '';
        this.description = '';
        this.UoM = new UoM();

        this.copy(source);
    }
}

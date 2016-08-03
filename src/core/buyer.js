'use strict'

var BaseModel = require('capital-models').BaseModel;

module.exports = class Buyer extends BaseModel {
    constructor(source) {
        super('buyer', '1.0.0');

        // Define properties.  
        this.code = '';
        this.name = '';
        this.description = '';
        this.phone='';
        this.address='';
        this.local= true;

        this.copy(source);
    }
}
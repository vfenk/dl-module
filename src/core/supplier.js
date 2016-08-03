'use strict'

var BaseModel = require("capital-models").BaseModel;

module.exports = class Supplier extends BaseModel {
    constructor(source) {
        super('supplier', '1.0.0'); // call MongoModel constructor

        // Define properties.
        //this.childProperty = ''; // property need to be initialized.
        //this.otherChildProperty = {}; // property need to be initialized.
        this.code = '';
        this.name = '';
        this.description = '';
        this.phone = '';
        this.address = '';
        this.local = true;

        this.copy(source);
    }
}
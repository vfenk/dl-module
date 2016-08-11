'use strict'

var BaseModel = require("capital-models").BaseModel;

module.exports = class Product extends BaseModel {
    constructor(source) {
        super('product', '1.0.0'); // call MongoModel constructor

        // Define properties.
        this.childProperty = ''; // property need to be initialized.
        this.otherChildProperty = {}; // property need to be initialized.

        this.copy(source);
    }
}

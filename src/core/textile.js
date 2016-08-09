'use strict'

var BaseModel = require("capital-models").BaseModel;

module.exports = class Textile extends BaseModel {
    constructor(source) {
        super('textile', '1.0.0'); // call MongoModel constructor

        // Define properties
        this.code = '';
        this.name = '';        
        this.description = '';
        this.copy(source);
    }
}
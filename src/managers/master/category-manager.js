'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Category = DLModels.core.Category;

module.exports = class CategoryManager {

    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.CategoryCollection = this.db.use(map.core.collection.Category);
    }

    create(category) {
        return new Promise((resolve, reject) => {
            // this._validate(category)
            //     .then(validcategory => {
                    this.CategoryCollection.insert(category)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                // })
                // .catch(e => {
                //     reject(e);
                // })
        });
    } 
   
}
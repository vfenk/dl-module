'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Category = DLModels.master.Category;
var BaseManager = require('../base-manager');

module.exports = class CategoryManager  extends BaseManager  {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Category);
    }

    _getQuery(paging) {
        var deleted = {
            _deleted: false
        };
        var query = paging.keyword ? {
            '$and': [deleted]
        } : deleted;

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterName = {
                'name': {
                    '$regex': regex
                }
            };

            query['$and'].push(filterName);
        }
        return query;
    }
    
    _validate(category) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = category;
            // 1. begin: Declare promises.
            var getcategoryPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        name: valid.name
                    }]
            });

            // 2. begin: Validation.
            Promise.all([getcategoryPromise])
                .then(results => {
                    var _category = results[0];

                    if (!valid.name || valid.name == '')
                        errors["name"] = "Nama Kategori Tidak Boleh Kosong";
                    else if (_category) {
                        errors["name"] = "Nama Kategori sudah terdaftar";
                    }

                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Category(category);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
   
}
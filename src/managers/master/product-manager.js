'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var UomManager = require('./uom-manager');
var BaseManager = require('../base-manager');

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var Product = DLModels.master.Product;

module.exports = class ProductManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Product);
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
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterName = {
                'name': {
                    '$regex': regex
                }
            };
            var $or = {
                '$or': [filterCode, filterName]
            };

            query['$and'].push($or);
        }
        return query;
    }

    _validate(product) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = product;

            // 1. begin: Declare promises.
            var getProductPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });

            // 2. begin: Validation.
            Promise.all([getProductPromise])
                .then(results => {
                    var _module = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "Kode tidak boleh kosong.";
                    else if (_module) {
                        errors["code"] = "Kode sudah terdaftar.";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "Nama tidak boleh kosong.";

                    if (valid.uom) {
                        if (!valid.uom.unit || valid.uom.unit == '')
                            errors["uom"] = "Satuan tidak boleh kosong";
                    }
                    else
                        errors["uom"] = "Satuan tidak boleh kosong";

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('Product Manager : data does not pass validation', errors));
                    }

                    if (!valid.stamp)
                        valid = new Product(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
};

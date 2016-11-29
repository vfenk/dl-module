'use strict'

var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var ThreadSpecification = DLModels.master.ThreadSpecification;
var ProductManager = require('../master/product-manager');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');

module.exports = class ThreadSpecificationManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.ThreadSpecification);
        this.productManager = new ProductManager(db, user);
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
                'product.name': {
                    '$regex': regex
                }
            };
            var filterCode = {
                'product.code': {
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

    _validate(threadSpecification) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = threadSpecification;
            // 1. begin: Declare promises.
            var getThreadSpecificationPromise = this.collection.singleOrDefault({
                "$and": [{
                    "$and": [{
                        _id: {
                            '$ne': new ObjectId(valid._id)
                        }
                    }, {
                        productId: new ObjectId(valid.productId)
                    }]
                },
                {
                    _deleted: false
                }]
            });

            var getProduct = valid.productId && ObjectId.isValid(valid.productId) ? this.productManager.getSingleByIdOrDefault(valid.productId) : Promise.resolve(null);

            Promise.all([getThreadSpecificationPromise, getProduct])
                .then(results => {
                    var _module = results[0];
                    var _product = results[1];
                    var now = new Date();

                    if (!_product)
                        errors["product"] = i18n.__("ThreadSpecification.product.isRequired:%s is not exists", i18n.__("ThreadSpecification.product._:Product"));
                    else if (!valid.productId)
                        errors["product"] = i18n.__("ThreadSpecification.product.isRequired:%s is required", i18n.__("ThreadSpecification.product._:Product"));
                    else if (valid.product) {
                        if (!valid.product._id)
                            errors["product"] = i18n.__("ThreadSpecification.product.isRequired:%s is required", i18n.__("ThreadSpecification.product._:Product"));
                    }

                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new ThreadSpecification(threadSpecification);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });

    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.master.collection.ThreadSpecification}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.master.collection.ThreadSpecification}_productId`,
            key: {
                productId: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }
}
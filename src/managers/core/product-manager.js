'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var UoMManager = require('./UoM-manager');

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var Product = DLModels.core.Product;

module.exports = class ProductManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.uomManager = new UoMManager(db, user);
        this.productCollection = this.db.use(map.core.collection.Product);
    }

    readAll(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);
        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
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


            this.productCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(products => {
                    resolve(products);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    create(product) {
        return new Promise((resolve, reject) => {
            this._validate(product)
                .then(validProduct => {
                    if (!validProduct.UoM._id) {
                        this.uomManager.create(validProduct.UoM)
                            .then(id => {
                                validProduct.UoMID = id;
                                this.uomManager.getById(id)
                                    .then(UoM => {
                                        validProduct.UoM = UoM

                                        this.productCollection.insert(validProduct)
                                            .then(id => {
                                                resolve(id);
                                            })
                                            .catch(e => {
                                                reject(e);
                                            })
                                    })
                                    .catch(e => {
                                        reject(e)
                                    })

                            })
                            .catch(e => {
                                reject(e);
                            })
                    }
                    else {
                        this.productCollection.insert(validProduct)
                            .then(id => {
                                resolve(id);
                            })
                            .catch(e => {
                                reject(e);
                            })
                    }
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(product) {
        return new Promise((resolve, reject) => {
            this._validate(product)
                .then(validProduct => {
                    if (!validProduct.UoM._id) {
                        this.uomManager.create(validProduct.UoM)
                            .then(id => {
                                validProduct.UoMID = id;
                                this.uomManager.getById(id)
                                    .then(UoM => {
                                        validProduct.UoM = UoM

                                        this.productCollection.update(validProduct)
                                            .then(id => {
                                                resolve(id);
                                            })
                                            .catch(e => {
                                                reject(e);
                                            })
                                    })
                                    .catch(e => {
                                        reject(e)
                                    })

                            })
                            .catch(e => {
                                reject(e);
                            })
                    }
                    else {
                        this.productCollection.update(validProduct)
                            .then(id => {
                                resolve(id);
                            })
                            .catch(e => {
                                reject(e);
                            })
                    }
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    delete(product) {
        return new Promise((resolve, reject) => {
            this._validate(product)
                .then(validProduct => {
                    validProduct._deleted = true;
                    this.productCollection.update(validProduct)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    _validate(product) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = product;

            // 1. begin: Declare promises.
            var getProductPromise = this.productCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getProductPromise])
                .then(results => {
                    var _module = results[0];

                    if (valid._type == map.core.type.Fabric)
                        if (!valid.detail.composition || valid.detail.composition == '')
                            errors["composition"] = "Komposisi tidak boleh kosong";
                    if (!valid.code || valid.code == '')
                        errors["code"] = "Kode tidak boleh kosong.";
                    else if (_module) {
                        errors["code"] = "Kode sudah terdaftar.";
                    }

                    if (valid.price)
                        if (valid.price.length > 17)
                            errors["price"] = "Harga maksimum 17 digit";

                    if (!valid.name || valid.name == '')
                        errors["name"] = "Nama tidak boleh kosong.";

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

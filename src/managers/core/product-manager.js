var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");

var Product = require("dl-models").core.Product;


module.exports = class ProductManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.productCollection = this.db.collection("products");
    }

    read(paging) {
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

                    this.productCollection.insert(validProduct)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
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
                    this.productCollection.update(validProduct)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
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
                        })
                })
                .catch(e => {
                    reject(e);
                })
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
                    var _product = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_product) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required";

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Product(product);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }



    getById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(product => {
                    resolve(product);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    
    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQueryOrDefault(query)
                .then(product => {
                    resolve(product);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.productCollection
                .single(query)
                .then(product => {
                    resolve(product);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleByQueryOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.productCollection
                .singleOrDefault(query)
                .then(product => {
                    resolve(product);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
}
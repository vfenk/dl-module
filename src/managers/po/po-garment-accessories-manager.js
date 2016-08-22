'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var POGarmentAccessories = DLModels.po.POGarmentAccessories;

module.export = class POGarmentAccessoriesManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.POGarmentAccessoriesCollection = this.db.use(map.po.POGarmentAccessories);
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
                var filterRONo = {
                    'RONo': {
                        '$regex': regex
                    }
                };
                var filterPRNo = {
                    'PRNo': {
                        '$regex': regex
                    }
                };
                var filterPONo = {
                    'PONo': {
                        '$regex': regex
                    }
                };

                var $or = {
                    '$or': [filterRONo, filterPRNo, filterPONo]
                };

                query['$and'].push($or);
            }


            this.POGarmentAccessoriesCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(POGarmentAccessoriess => {
                    resolve(POGarmentAccessoriess);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    readByPOGarmentAccessoriesId(POGarmentAccessoriesId, paging) {
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
            var POGarmentAccessories = {
                POGarmentAccessoriesId: new ObjectId(POGarmentAccessoriesId)
            };
            var query = {
                '$and': [deleted, module]
            };

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterRONo = {
                    'RONo': {
                        '$regex': regex
                    }
                };
                var filterPRNo = {
                    'PRNo': {
                        '$regex': regex
                    }
                };
                var filterPONo = {
                    'PONo': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterRONo, filterPRNo, filterPONo]
                };

                query['$and'].push($or);
            }


            this.POGarmentAccessoriesCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(POGarmentAccessories => {
                    resolve(POGarmentAccessories);
                })
                .catch(e => {
                    reject(e);
                });
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
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByFKPO(RONo, PRNo, PONo) {
        return new Promise((resolve, reject) => {
            if (code === '')
                resolve(null);
            var query = {
                RONo: RONo,
                PRNo: PRNo,
                PONo: PONo,
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(module => {
                    resolve(module);
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
            this.getSingleOrDefaultByQuery(query)
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.POGarmentAccessoriesCollection
                .single(query)
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.POGarmentAccessoriesCollection
                .singleOrDefault(query)
                .then(fabric => {
                    resolve(fabric);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(POGarmentAccessories) {
        return new Promise((resolve, reject) => {
            this._validate(POGarmentAccessories)
                .then(validPOGarmentAccessories => {
                    this.POGarmentAccessoriesCollection.insert(validPOGarmentAccessories)
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

    update(POGarmentAccessories) {
        return new Promise((resolve, reject) => {
            this._validate(POGarmentAccessories)
                .then(validPOGarmentAccessories => {
                    this.POGarmentAccessoriesCollection.update(validPOGarmentAccessories)
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

    delete(POGarmentAccessories) {
        return new Promise((resolve, reject) => {
            this._validate(POGarmentAccessories)
                .then(validPOGarmentAccessories => {
                    validPOGarmentAccessories._deleted = true;
                    this.POGarmentAccessoriesCollection.update(validPOGarmentAccessories)
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

    _validate(POGarmentAccessories) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new POGarmentAccessories(POGarmentAccessories);

            // 1. begin: Declare promises.
            var getPOGarmentAccessoriesPromise = this.POGarmentAccessoriesCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        // code: valid.code
                    }]
            });

            // 1. end: Declare promises.

            var getByFKPOData = this.getByFKPO(POGarmentAccessories.RONo, POGarmentAccessories.PRNo, POGarmentAccessories.POGarmentAccessories)
            // 2. begin: Validation.
            Promise.all([getPOGarmentAccessoriesPromise, getByFKPOData])
                .then(results => {
                    var _module = results[0];
                    var _FKPO = results[1];

                    if (!valid.RONo || valid.RONo == '')
                        errors["RONo"] = "Nomor RO tidak boleh kosong";
                    if (!valid.PRNo || valid.PRNo == '')
                        errors["PRNo"] = "Nomor PR tidak boleh kosong";
                    if (!valid.PONo || valid.PONo == '')
                        errors["PONo"] = "Nomor PO tidak boleh kosong";
                    if (!valid.supplierId || valid.supplierId == '')
                        errors["storageId"] = "Nama Supplier tidak boleh kosong";
                    if (!valid.deliveryDate || valid.deliveryDate == '')
                        errors["deliveryDate"] = "Tanggal Kirim tidak boleh kosong";
                    if (!valid.termOfPayment || valid.termOfPayment == '')
                        errors["termOfPayment"] = "Pembayaran tidak boleh kosong";
                    if (!valid.deliveryFeeByBuyer || valid.deliveryFeeByBuyer == '')
                        errors["deliveryFeeByBuyer"] = "Pilih salah satu ongkos kirim";
                    if (!valid.description || valid.description == '')
                        errors["description"] = "Keterangan tidak boleh kosong";
                    if (_FKPO) {
                        errors["code"] = "RO, PR, da already exists";
                    }


                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

};
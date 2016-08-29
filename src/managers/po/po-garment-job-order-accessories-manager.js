'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var POGarmentJobOrderAccessories = DLModels.po.POGarmentJobOrderAccessories;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;
var poType = map.po.type.POGarmentJobOrderAccessories;

var moduleId = 'POJOA'

var generateCode = require('../.././utils/code-generator');

module.exports = class POGarmentJobOrderAccessoriesManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.POGarmentJobOrderAccessoriesCollection = this.db.use(map.po.collection.PurchaseOrder);

        var PurchaseOrderGroupManager = require('./purchase-order-group-manager');
        this.purchaseOrderGroupManager = new PurchaseOrderGroupManager(db, user);

        var PurchaseOrderManager = require("./purchase-order-manager");
        this.purchaseOrderManager = new PurchaseOrderManager(db, user);

        this.PurchaseOrderGroupCollection = this.db.use(map.po.collection.PurchaseOrderGroup);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var filter = {
                _deleted: false,
                _type: poType
            };

            var query = _paging.keyword ? {
                '$and': [filter]
            } : filter;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterRONo = {
                    'RONo': {
                        '$regex': regex
                    }
                };
                var filterRefPONo = {
                    'RefPONo': {
                        '$regex': regex
                    }
                };

                var filterPONo = {
                    'PONo': {
                        '$regex': regex
                    }
                };
                var filterBuyerName = {
                    'buyer.name': {
                        '$regex': regex
                    }
                };

                var $or = {
                    '$or': [filterRONo, filterRefPONo, filterPONo, filterBuyerName]
                };

                query['$and'].push($or);
            }

            this.POGarmentJobOrderAccessoriesCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(POGarmentJobOrderAccessoriess => {
                    resolve(POGarmentJobOrderAccessoriess);
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
                _deleted: false,
                _type: poType
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
            var query = {
                RONo: RONo,
                PRNo: PRNo,
                PONo: PONo,
                _deleted: false,
                _type: poType
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

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false,
                _type: poType
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
            this.POGarmentJobOrderAccessoriesCollection
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
            this.POGarmentJobOrderAccessoriesCollection
                .singleOrDefault(query)
                .then(POGarmentJobOrderAccessoriess => {
                    resolve(POGarmentJobOrderAccessoriess);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getByPONo(poNo) {
        return new Promise((resolve, reject) => {
            if (poNo === '')
                resolve(null);
            var query = {
                PONo: poNo,
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

    create(poGarmentJobOrderAccessories) {
        poGarmentJobOrderAccessories = new POGarmentJobOrderAccessories(poGarmentJobOrderAccessories);
        poGarmentJobOrderAccessories.PONo = generateCode(moduleId);
        
        return new Promise((resolve, reject) => {
            this._validate(poGarmentJobOrderAccessories)
                .then(validpoGarmentJobOrderAccessories => {
                    this.purchaseOrderManager.create(validpoGarmentJobOrderAccessories)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    update(poGarmentJobOrderAccessories) {
        poGarmentJobOrderAccessories = new POGarmentJobOrderAccessories(poGarmentJobOrderAccessories);
        return new Promise((resolve, reject) => {
            this.purchaseOrderManager.update(poGarmentJobOrderAccessories)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    delete(poGarmentJobOrderAccessories) {
        poGarmentJobOrderAccessories = new POGarmentJobOrderAccessories(poGarmentJobOrderAccessories);
        return new Promise((resolve, reject) => {

            poGarmentJobOrderAccessories._deleted = true;
            this.purchaseOrderManager.delete(poGarmentJobOrderAccessories)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }
    
    _validate(poGarmentJobOrderAccessories) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = poGarmentJobOrderAccessories;

            var getPOGarmentJobOrderAccessoriesPromise = this.POGarmentJobOrderAccessoriesCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        // code: valid.code
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getPOGarmentJobOrderAccessoriesPromise])
                .then(results => {
                    var _module = results[0];

                    if (!valid.PRNo || valid.PRNo == '')
                        errors["PRNo"] = "Nomor PR tidak boleh kosong";
                    if (!valid.PRNo || valid.PRNo == '')
                        errors["RONo"] = "Nomor RO tidak boleh kosong";
                    if (!valid.article || valid.article == '')
                        errors["article"] = "Artikel tidak boleh kosong";

                    if (!valid.buyerId || valid.buyerId == '')
                        errors["buyerId"] = "Nama Pembeli tidak boleh kosong";
                    if (!valid.buyer.name || valid.buyer.name == '')
                        errors["buyerId"] = "Nama Pembeli tidak terdaftar";

                    this.purchaseOrderManager._validatePO(valid, errors);

                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    if (!valid.stamp)
                        valid = new PurchaseOrder(valid);

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
    
    // ====================================PO DL===========================================

    readAllPurchaseOrderGroup(paging) {
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
            var type = {
                _type: poType
            }

            var query = {
                '$and': [deleted, type]
            };

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterPODLNo = {
                    'PODLNo': {
                        '$regex': regex
                    }
                };
                
                var filterSupplierName = {
                    'supplier.name': {
                        '$regex': regex
                    }
                };
                
                var $or = {
                    '$or': [filterPODLNo, filterSupplierName]
                };

                query['$and'].push($or);
            }

            this.PurchaseOrderGroupCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(PurchaseOrderGroups => {
                    resolve(PurchaseOrderGroups);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    createGroup(poGroupJobOrderAccessories) {
        return new Promise((resolve, reject) => {
            poGroupJobOrderAccessories = new PurchaseOrderGroup(poGroupJobOrderAccessories)
            poGroupJobOrderAccessories.PODLNo = generateCode('PODL/JOA')
            poGroupJobOrderAccessories._type = poType

            this.purchaseOrderGroupManager.create(poGroupJobOrderAccessories)
                .then(id => {
                    for (var data of poGroupJobOrderAccessories.items) {
                        data.PODLNo = newPpoGroupJobOrderAccessoriesOGroup.PODLNo
                        this.update(data)
                    }

                    resolve(id);
                    
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    getPurchaseOrderGroupById(id) {
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

    getSinglePurchaseOrderGroupByQuery(query) {
        return new Promise((resolve, reject) => {
            this.PurchaseOrderGroupCollection
                .single(query)
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
}
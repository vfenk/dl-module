'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var POTextileGeneralATK = DLModels.po.POTextileGeneralATK;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;

var moduleId = 'POGG'

var poType = map.po.type.POTextileGeneralATK;

var generateCode = require('../.././utils/code-generator');

module.exports = class POTextileGeneralATKManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.POTextileGeneralATKCollection = this.db.use(map.po.collection.PurchaseOrder);

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

                var $or = {
                    '$or': [filterRONo, filterRefPONo, filterPONo]
                };

                query['$and'].push($or);
            }

            this.POTextileGeneralATKCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(POTextileGeneralATKs => {
                    resolve(POTextileGeneralATKs);
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
            this.POTextileGeneralATKCollection
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
            this.POTextileGeneralATKCollection
                .singleOrDefault(query)
                .then(fabric => {
                    resolve(fabric);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(poTextileGeneralATK) {
        poTextileGeneralATK = new POTextileGeneralATK(poTextileGeneralATK);
        poTextileGeneralATK.PONo = generateCode(moduleId)
        return new Promise((resolve, reject) => {
            this._validate(poTextileGeneralATK)
                .then(validpoTextileGeneralATK => {
                    this.purchaseOrderManager.create(validpoTextileGeneralATK)
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

    createGroup(items) {
        return new Promise((resolve, reject) => {
            var newPOGroup = new PurchaseOrderGroup()

            newPOGroup.PODLNo = generateCode('PODL/TGA')
            newPOGroup._type = poType

            var _tasks = [];

            for (var item of items) {
                _tasks.push(this.getByPONo(item))
            }

            Promise.all(_tasks)
                .then(results => {
                    newPOGroup.items = results
                    this.purchaseOrderGroupManager.create(newPOGroup)
                        .then(id => {
                            for (var data of newPOGroup.items) {
                                data.PODLNo = newPOGroup.PODLNo
                                this.update(data)
                            }

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

    update(poTextileGeneralATK) {
        poTextileGeneralATK = new POTextileGeneralATK(poTextileGeneralATK);
        return new Promise((resolve, reject) => {
            this._validate(poTextileGeneralATK)
                .then(validpoTextileGeneralATK => {
                    this.purchaseOrderManager.update(validpoTextileGeneralATK)
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
        });
    }

    delete(poTextileGeneralATK) {
        poTextileGeneralATK = new POTextileGeneralATK(poTextileGeneralATK);
        return new Promise((resolve, reject) => {

            poTextileGeneralATK._deleted = true;
            this.purchaseOrderManager.delete(poTextileGeneralATK)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                });

        });
    }

    _validate(poTextileGeneralATK) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = poTextileGeneralATK;

            var getPOTextileGeneralATKPromise = this.POTextileGeneralATKCollection.singleOrDefault({
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
            Promise.all([getPOTextileGeneralATKPromise])
                .then(results => {
                    var _module = results[0];
                    
                    if (!valid.PRNo || valid.PRNo == '')
                        errors["PRNo"] = "Nomor PR tidak boleh kosong";
                    
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

                var $or = {
                    '$or': [filterPODLNo]
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

    createGroup(items) {
        return new Promise((resolve, reject) => {
            var newPOGroup = new PurchaseOrderGroup()

            newPOGroup.PODLNo = generateCode('PODL/TGA')
            newPOGroup._type = poType

            var _tasks = [];

            for (var item of items) {
                _tasks.push(this.getByPONo(item))
            }

            Promise.all(_tasks)
                .then(results => {
                    newPOGroup.items = results
                    this.purchaseOrderGroupManager.create(newPOGroup)
                        .then(id => {
                            for (var data of newPOGroup.items) {
                                data.PODLNo = newPOGroup.PODLNo
                                this.update(data)
                                    .then(id => {
                                        resolve(id);
                                    })
                                    .catch(e => {
                                        reject(e);
                                    });
                            }
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
}
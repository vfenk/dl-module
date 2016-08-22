'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var POTextileJobOrder = DLModels.po.POTextileJobOrder;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;
var moduleId = 'POTJ'
var poType = map.po.type.POTextileJobOrderExternal;
var generateCode = require('../.././utils/code-generator');

module.exports = class POTextileJobOrderManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.POTextileJobOrderCollection = this.db.use(map.po.collection.PurchaseOrder);
        
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
            }
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


            this.POTextileJobOrderCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(POTextileJobOrders => {
                    resolve(POTextileJobOrders);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    
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
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

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
            this.POTextileJobOrderCollection
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
            this.POTextileJobOrderCollection
                .singleOrDefault(query)
                .then(POTextileJobOrders => {
                    resolve(POTextileJobOrders);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(poTextileJobOrder) {
        poTextileJobOrder = new POTextileJobOrder(poTextileJobOrder);
        return new Promise((resolve, reject) => {
            poTextileJobOrder.PONo = generateCode(moduleId)
            this._validate(poTextileJobOrder)
            .then(validpoTextileJobOrder => {
                this.purchaseOrderManager.create(validpoTextileJobOrder)
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
        })
    }
    
    createGroup(items) {
        return new Promise((resolve, reject) => {
            var newPOGroup = new PurchaseOrderGroup()

            newPOGroup.PODLNo = generateCode('PODL/TJ')
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

    update(poTextileJobOrder) {
         poTextileJobOrder = new POTextileJobOrder(poTextileJobOrder);
        return new Promise((resolve, reject) => {
            this._validate(poTextileJobOrder)
            .then(validpoTextileJobOrder => {
                this.purchaseOrderManager.update(validpoTextileJobOrder)
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
        })
    }

    delete(poTextileJobOrder) {
        poTextileJobOrder = new POTextileJobOrder(poTextileJobOrder);
        return new Promise((resolve, reject) => {
            this._validate(poTextileJobOrder)
            .then(validpoTextileJobOrder => {
                this.purchaseOrderManager.delete(validpoTextileJobOrder)
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
        })
    }
    
    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;
                    // if (!valid.RONo || valid.RONo == '')
                    //     errors["RONo"] = "Nomor RO tidak boleh kosong";
                    // if (!valid.article || valid.article == '')
                    //     errors["article"] = "Article tidak boleh kosong";
                    if (!valid.buyerId || valid.buyerId == '')
                        errors["buyerId"] = "Nama Pembeli tidak boleh kosong";
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    if (!valid.stamp)
                        valid = new PurchaseOrder(valid);

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
        });
    }
};
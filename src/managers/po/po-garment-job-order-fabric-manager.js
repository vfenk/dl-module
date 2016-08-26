'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var POGarmentJobOrderFabric = DLModels.po.POGarmentJobOrderFabric;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;
var moduleId = 'POTJ'
var poType = map.po.type.POGarmentJobOrderFabric;
var generateCode = require('../.././utils/code-generator');

module.exports = class POGarmentJobOrderFabricManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.POGarmentJobOrderFabricCollection = this.db.use(map.po.collection.PurchaseOrder);

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

            this.POGarmentJobOrderFabricCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(POGarmentJobOrderFabrics => {
                    resolve(POGarmentJobOrderFabrics);
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
            this.POGarmentJobOrderFabricCollection
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
            this.POGarmentJobOrderFabricCollection
                .singleOrDefault(query)
                .then(fabric => {
                    resolve(fabric);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(poGarmentJobOrderFabric) {
        poGarmentJobOrderFabric = new POGarmentJobOrderFabric(poGarmentJobOrderFabric);
        return new Promise((resolve, reject) => {
            poGarmentJobOrderFabric.PONo = generateCode(moduleId)
            this._validate(poGarmentJobOrderFabric)
                .then(validpoGarmentJobOrderFabric => {
                    this.purchaseOrderManager.create(validpoGarmentJobOrderFabric)
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

    createGroup(items) {
        return new Promise((resolve, reject) => {
            var newPOGroup = new PurchaseOrderGroup()
            newPOGroup.PODLNo = generateCode('PODL/GJOF')
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

    update(poGarmentJobOrderFabric) {
        poGarmentJobOrderFabric = new POGarmentJobOrderFabric(poGarmentJobOrderFabric);
        return new Promise((resolve, reject) => {
            this._validate(poGarmentJobOrderFabric)
                .then(validpoGarmentJobOrderFabric => {
                    this.purchaseOrderManager.update(validpoGarmentJobOrderFabric)
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
        })
    }

    delete(poGarmentJobOrderFabric) {
        poGarmentJobOrderFabric = new POGarmentJobOrder(poGarmentJobOrderFabric);
        return new Promise((resolve, reject) => {

            poGarmentJobOrderFabric._deleted = true;
            this.purchaseOrderManager.delete(poGarmentJobOrderFabric)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                });

        });
    }
    _validate(poGarmentJobOrderFabric) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = poGarmentJobOrderFabric;

            if (!valid.PRNo || valid.PRNo == '')
                errors["PRNo"] = "Nomor PR tidak boleh kosong";
                    if (!valid.RONo || valid.RONo == '')
                        errors["RONo"] = "Nomor RO tidak boleh kosong";
            if (!valid.article || valid.article == '')
                errors["article"] = "Artikel tidak boleh kosong";
            if (!valid.buyer._id || valid.buyer._id == '')
                errors["buyerId"] = "Nama Pembeli tidak boleh kosong";

            this.purchaseOrderManager._validatePO(valid, errors);

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

            newPOGroup.PODLNo = generateCode('PODL/GJOF')
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
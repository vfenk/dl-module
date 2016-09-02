'use strict'

var PurchaseOrderBaseManager = require('./purchase-order-base-manager');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrder = DLModels.po.PurchaseOrder;

var generateCode = require('../../utils/code-generator');

var POGarmentGeneral = DLModels.po.POGarmentGeneral;

module.exports = class POGarmentGeneralManager extends PurchaseOrderBaseManager {
    constructor(db, user) {
        super(db, user);

        this.moduleId = 'POGG'
        this.poType = map.po.type.POGarmentGeneral;
    }

    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            if (!valid.PRNo || valid.PRNo == '')
                errors["PRNo"] = "Nomor PR tidak boleh kosong";

            this.purchaseOrderManager._validatePO(valid, errors);

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

    _getQueryPurchaseOrder(_paging) {
        var filter = {
            _deleted: false,
            _type: this.poType
        };

        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterPRNo = {
                'PRNo': {
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
                '$or': [filterPRNo, filterRefPONo, filterPONo]
            };

            query['$and'].push($or);
        }

        return query;
    }
    
    _getQueryPurchaseOrderGroup(_paging) {
        var filter = {
            _deleted: false,
            _type: this.poType
        };
        
        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

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

        return query;
    }
    
    create(purchaseOrder) {
        purchaseOrder = new POGarmentGeneral(purchaseOrder);
        
        var konveksi = purchaseOrder.RONo.substring(3,4);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${konveksi}${generateCode()}`;
            this._validate(purchaseOrder)
                .then(validPurchaseOrderl => {
                    this.purchaseOrderManager.create(validPurchaseOrderl)
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
    
    createGroup(purchaseOrderGroup) {
        
        purchaseOrderGroup.PODLNo = `PO/DL/${this.year}${generateCode()}`;
        purchaseOrderGroup._type = this.poType
            
        return new Promise((resolve, reject) => {
            this.purchaseOrderGroupManager.create(purchaseOrderGroup)
                .then(id => {
                    
                    var tasks = [];
                    for (var data of purchaseOrderGroup.items) {
                        data.PODLNo = purchaseOrderGroup.PODLNo
                        data.supplier = purchaseOrderGroup.supplier;
                        data.supplierId = purchaseOrderGroup.supplierId;
                        data.paymentDue = purchaseOrderGroup.paymentDue;
                        data.currency = purchaseOrderGroup.currency;
                        data.usePPn = purchaseOrderGroup.usePPn;
                        data.usePPh = purchaseOrderGroup.usePPh;
                        data.deliveryDate = purchaseOrderGroup.deliveryDate;
                        data.deliveryFeeByBuyer = purchaseOrderGroup.deliveryFeeByBuyer;
                        
                        tasks.push(this.update(data));
                    }
                    
                    Promise.all(tasks)
                        .then(results => {
                            resolve(id);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
    
    split(purchaseOrder) {
        purchaseOrder = new POGarmentGeneral(purchaseOrder);
        
        var konveksi = purchaseOrder.RONo.substring(3,4);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${konveksi}${generateCode()}`;
            
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.purchaseOrderManager.create(validPurchaseOrder)
                        .then(id => {
                            this.getByPONo(validPurchaseOrder.linkedPONo).then(po => {
                                    
                                for (var index in po.items) {
                                    po.items[index].dealQuantity = po.items[index].dealQuantity - validPurchaseOrder.items[index].dealQuantity;
                                    po.items[index].defaultQuantity = po.items[index].defaultQuantity - validPurchaseOrder.items[index].defaultQuantity;
                                }
                                
                                this.update(po)
                                    .then(results => {
                                        console.log(8);
                                        resolve(id);
                                    })
                            })
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
}
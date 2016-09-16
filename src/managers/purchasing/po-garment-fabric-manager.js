'use strict'

var PurchaseOrderBaseManager = require('./purchase-order-base-manager');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrder = DLModels.po.PurchaseOrder;

var generateCode = require('../../utils/code-generator');

var POGarmentFabric = DLModels.po.POGarmentFabric;

module.exports = class POGarmentFabricManager extends PurchaseOrderBaseManager {
    constructor(db, user) {
        super(db, user);

        this.moduleId = 'POGF'
        this.poType = map.po.type.POGarmentFabric;
    }

    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            if (!valid.PRNo || valid.PRNo == '')
                errors["PRNo"] = "Nomor PR tidak boleh kosong";
            if (!valid.RONo || valid.RONo == '')
                errors["RONo"] = "Nomor RO tidak boleh kosong";
            if (!valid.article || valid.article == '')
                errors["article"] = "Artikel tidak boleh kosong";
                
            if (valid.buyer) {
                if (!valid.buyerId || valid.buyerId == '')
                    errors["buyerId"] = "Nama Buyer tidak terdaftar";
            }
            else 
                errors["buyerId"] = "Nama Buyer tidak boleh kosong";

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
            var filterPRNo = {
                'PRNo': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterRONo, filterRefPONo, filterPONo, filterPRNo]
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
        purchaseOrder = new POGarmentFabric(purchaseOrder);
        
        var konveksi = purchaseOrder.RONo.substring(3,4);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${konveksi}${generateCode()}`;
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.purchaseOrderManager.create(validPurchaseOrder)
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
                        data.standardQuality = purchaseOrderGroup.standardQuality;
                        data.otherTest = purchaseOrderGroup.otherTest;
                        
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
        purchaseOrder = new POGarmentFabric(purchaseOrder);
        
        var konveksi = purchaseOrder.RONo.substring(3,4);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${konveksi}${generateCode()}`;
            
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.purchaseOrderManager.create(validPurchaseOrder)
                        .then(id => {
                            this.getByPONo(validPurchaseOrder.linkedPONo).then(po => {
                                
                                for (var item of validPurchaseOrder.items) {
                                    for (var product of po.items) {
                                        if (item.product.code == product.product.code) {
                                            product.dealQuantity = product.dealQuantity - item.dealQuantity
                                            product.defaultQuantity = product.defaultQuantity - item.defaultQuantity
                                            
                                            break;
                                        }
                                    } 
                                }
                                
                                this.update(po)
                                    .then(results => {
                                        // console.log(8);
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
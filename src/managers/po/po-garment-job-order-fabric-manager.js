'use strict'

var PurchaseOrderBaseManager = require('../purchase-order-base-manager');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrder = DLModels.po.PurchaseOrder;

var generateCode = require('../../utils/code-generator');

var POGarmentJobOrderFabric = DLModels.po.POGarmentJobOrderFabric;

module.exports = class POGarmentJobOrderFabricManager extends PurchaseOrderBaseManager {
    constructor(db, user) {
        super(db, user);

        this.moduleId = 'POJOF'
        this.poType = map.po.type.POGarmentJobOrderFabric;
    }
    
    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            if (!valid.PRNo || valid.PRNo == '')
                errors["PRNo"] = "Nomor PR tidak boleh kosong";
            if (!valid.PRNo || valid.PRNo == '')
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
        purchaseOrder = new POGarmentJobOrderFabric(purchaseOrder);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = generateCode(this.moduleId);
            this._validate(purchaseOrder)
                .then(validPurchaseOrderc => {
                    this.purchaseOrderManager.create(validPurchaseOrderc)
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
}
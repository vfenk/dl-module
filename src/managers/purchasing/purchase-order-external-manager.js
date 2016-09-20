'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrderExternal = DLModels.purchasing.PurchaseOrderExternal;
var PurchaseOrderManager = require('./purchase-order-manager');
var BaseManager = require('../base-manager');
var generateCode = require('../../utils/code-generator');

module.exports = class PurchaseOrderExternalManager  extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.purchasing.collection.PurchaseOrderExternal);
        this.purchaseOrderManager = new PurchaseOrderManager(db, user);
    }
    
    _getQuery(paging) {
        var filter = {
            _deleted: false
        };

        var query = paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");

            var filterPODLNo = {
                'no': {
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
    
    create(purchaseOrderExternal) {
        purchaseOrderExternal.no = `PO/DL/${this.year}${generateCode()}`;
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrderExternal)
                .then(validPurchaseOrderExternal => {
                    this.collection.insert(validPurchaseOrderExternal)
                        .then(id => {
                            var tasks = [];
                            for (var data of validPurchaseOrderExternal.items) {
                                var getPOItemById = this.purchaseOrderManager.getSingleById(data._id);

                                Promise.all([getPOItemById])
                                    .then(result => {
                                        var poItem = result;
                                        poItem.purchaseOrderExternalId = validPurchaseOrderExternal._id;
                                        poItem.purchaseOrderExternal = validPurchaseOrderExternal;
                                        poItem.supplierId = validPurchaseOrderExternal.supplierId;
                                        poItem.supplier = validPurchaseOrderExternal.supplier;
                                        poItem.freightCostBy = validPurchaseOrderExternal.freightCostBy;
                                        poItem.paymentMethod = validPurchaseOrderExternal.paymentMethod;
                                        poItem.paymentDueDays = validPurchaseOrderExternal.paymentDueDays;
                                        poItem.useVat = validPurchaseOrderExternal.useVat;
                                        poItem.vatRate = validPurchaseOrderExternal.vatRate;
                                        poItem.useIncomeTax = validPurchaseOrderExternal.useIncomeTax;
                                        tasks.push(this.purchaseOrderManager.update(poItem));
                                    })
                                    .catch(e => {
                                        reject(e);
                                    })
                            }
                            Promise.all(tasks)
                                .then(results => {
                                    resolve(id);
                                })
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

    _validate(purchaseOrderGroup) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrderGroup;
            
            if (!valid.supplierId || valid.supplierId.toString() == '')
                errors["supplierId"] = "Nama Supplier tidak boleh kosong";
            
            if (!valid.expectedDeliveryDate || valid.expectedDeliveryDate == '')
                errors["expectedDeliveryDate"] = "Tanggal rencana kirim tidak boleh kosong";

            if (!valid.actualDeliveryDate || valid.actualDeliveryDate == '')
                errors["actualDeliveryDate"] = "Tanggal kirim tidak boleh kosong";
                
            if (!valid.paymentMethod || valid.paymentMethod == '')
                errors["paymentMethod"] = "Metode Pembayaran tidak boleh kosong";
                
            if (!valid.paymentDueDays || valid.paymentDueDays == '')
                errors["paymentDueDays"] = "Tempo Pembayaran tidak boleh kosong";
            
            if (valid.useVat == undefined || valid.useVat.toString() === '')
                itemError["useVat"] = "Pengenaan PPn harus dipilih";
                
            if (valid.useIncomeTax == undefined || valid.useIncomeTax.toString() === '')
                itemError["useIncomeTax"] = "Pengenaan PPh harus dipilih";
            
            if (valid.items.length <= 0) {
                errors["items"] = "Harus ada minimal 1 nomor PO";
            }

            // 2c. begin: check if data has any error, reject if it has.
            for (var prop in errors) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data podl does not pass validation', errors));
            }

            if (!valid.stamp)
                valid = new PurchaseOrderExternal(valid);

            valid.stamp(this.user.username, 'manager');
            resolve(valid);

        });
    }

}

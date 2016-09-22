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

module.exports = class PurchaseOrderExternalManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.purchasing.collection.PurchaseOrderExternal);
        this.year = (new Date()).getFullYear().toString().substring(2, 4);
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
                                    .then(results => {
                                        for(var result of results){
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
                                        }
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
        var purchaseOrderExternalError = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrderGroup;

            if (!valid.supplierId || valid.supplierId.toString() == '')
                purchaseOrderExternalError["supplierId"] = "Nama Supplier tidak boleh kosong";

            if (!valid.expectedDeliveryDate || valid.expectedDeliveryDate == '')
                purchaseOrderExternalError["expectedDeliveryDate"] = "Tanggal tersedia tidak boleh kosong";

            if (!valid.date || valid.date == '')
                purchaseOrderExternalError["date"] = "Tanggal tidak boleh kosong";

            if (!valid.paymentMethod || valid.paymentMethod == '')
                purchaseOrderExternalError["paymentMethod"] = "Metode Pembayaran tidak boleh kosong";

            if (!valid.currencyRate || valid.currencyRate == 0)
                purchaseOrderExternalError["currencyRate"] = "Rate tidak boleh kosong";

            if (!valid.paymentDueDays || valid.paymentDueDays == '')
                purchaseOrderExternalError["paymentDueDays"] = "Tempo Pembayaran tidak boleh kosong";

            // if (valid.useVat == undefined || valid.useVat.toString() === '')
            //     purchaseOrderExternalError["useVat"] = "Pengenaan PPn harus dipilih";

            // if (valid.useIncomeTax == undefined || valid.useIncomeTax.toString() === '')
            //     purchaseOrderExternalError["useIncomeTax"] = "Pengenaan PPh harus dipilih";

            if (valid.items && valid.items.length < 1)
                purchaseOrderExternalError["items"] = "Harus ada minimal 1 po internal";
            else {
                var purchaseOrderExternalItemErrors = [];
                var poItemExternalHasError = false;
                for (var purchaseOrder of valid.items) {
                    var purchaseOrderError = {};
                    var purchaseOrderItemErrors = [];
                    var poItemHasError = false;

                    if (!purchaseOrder.no || purchaseOrder.no == "") {
                        poItemHasError = true;
                        purchaseOrderError["no"] = "Purchase order internal tidak boleh kosong";
                    }

                    for (var poItem of purchaseOrder.items || []) {
                        var poItemError = {};
                        if (!poItem.dealQuantity || poItem.dealQuantity == 0) {
                            poItemHasError = true;
                            poItemError["dealQuantity"] = "Jumlah kesepakatan tidak boleh kosong";
                        }
                        if (!poItem.dealUom || !poItem.dealUom.unit || poItem.dealUom.unit == "") {
                            poItemHasError = true;
                            poItemError["dealUom"] = "Jumlah kesepakatan tidak boleh kosong";
                        }
                        if (!poItem.pricePerDealUnit || poItem.pricePerDealUnit == 0) {
                            poItemHasError = true;
                            poItemError["pricePerDealUnit"] = "Harga tidak boleh kosong";
                        }

                        if (!poItem.conversion || poItem.conversion == '') {
                            poItemHasError = true;
                            poItemError["conversion"] = "Konversi tidak boleh kosong";
                        }

                        purchaseOrderItemErrors.push(poItemError);
                    }
                    if (poItemHasError) {
                        poItemExternalHasError = true;
                        purchaseOrderError["items"] = purchaseOrderItemErrors;
                    }

                    purchaseOrderExternalItemErrors.push(purchaseOrderError);
                }
                if (poItemExternalHasError)
                    purchaseOrderExternalError["items"] = purchaseOrderExternalItemErrors;
            }


            // 2c. begin: check if data has any error, reject if it has.
            for (var prop in purchaseOrderExternalError) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data podl does not pass validation', purchaseOrderExternalError));
            }

            if (!valid.stamp)
                valid = new PurchaseOrderExternal(valid);

            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }
}

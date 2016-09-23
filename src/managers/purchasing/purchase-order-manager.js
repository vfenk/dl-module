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
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrderExternal)
                .then(validPurchaseOrderExternal => {
                    validPurchaseOrderExternal.no = this.generatePOno();
                    this.collection.insert(validPurchaseOrderExternal)
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

            if ((valid.currency.toUpperCase() !="IDR") && !valid.currencyRate || valid.currencyRate == 0)
                purchaseOrderExternalError["currencyRate"] = "Rate tidak boleh kosong";

            if ((valid.paymentMethod.toUpperCase() !="CASH") && !valid.paymentDueDays || valid.paymentDueDays == '')
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

    post(listPurchaseOrderExternal) {
        var tasks = [];
        return new Promise((resolve, reject) => {
            for (var purchaseOrderExternal of listPurchaseOrderExternal) {
                for (var data of purchaseOrderExternal.items) {
                    var getPOItemById = this.purchaseOrderManager.getSingleById(data._id);
                    Promise.all([getPOItemById])
                        .then(results => {
                            for (var result of results) {
                                var poItem = result;
                                poItem.purchaseOrderExternalId = data._id;
                                poItem.purchaseOrderExternal = data;
                                poItem.supplierId = data.supplierId;
                                poItem.supplier = data.supplier;
                                poItem.freightCostBy = data.freightCostBy;
                                poItem.pricePerDealUnit = data.pricePerDealUnit;
                                poItem.paymentMethod = data.paymentMethod;
                                poItem.paymentDueDays = data.paymentDueDays;
                                poItem.useVat = data.useVat;
                                poItem.vatRate = data.vatRate;
                                poItem.useIncomeTax = data.useIncomeTax;
                                poItem.isPosted = true;
                                tasks.push(this.purchaseOrderManager.update(poItem));
                            }
                        })
                        .catch(e => {
                            reject(e);
                        })
                }
                purchaseOrderExternal.isPosted = true;
                tasks.push(this.update(purchaseOrderExternal));
            }
            Promise.all(tasks)
                .then(result => {
                    resolve(result);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    generatePOno() {
        var now = new Date();
        var stamp = now / 1000 | 0;
        var code = stamp.toString().substring(0,5);
        var year = now.getFullYear();
        var month = now.getMonth();
        var initial = 'AS';
        var div = "UMUM";
        var unit = '';
        switch (div.toUpperCase().trim()) {
            case "UMUM":
                unit = 'PBL.A';
                break;
            case 'UTILITY':
                unit = 'PBL.C';
                break;
            case "FINISHING&PRINTING":
                unit = 'PBL.D';
                break;
            case 'WEAVING':
                unit = 'PBL.E';
                break;
            case "SPINNING":
                unit = 'PBL.F';
                break;
            default:
                unit = "PBL.X";
        }
        var no = `${code}/DL-${unit}/PO-${initial}/${month}/${year}`;
        return no;
    }
    
    _getQueryUnposted(_paging) {
        var filter = {
            _deleted: false,
            isPosted: false
        };

        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterRefPONo = {
                'refNo': {
                    '$regex': regex
                }
            };
            var filterPONo = {
                'no': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterRefPONo, filterPONo]
            };

            query['$and'].push($or);
        }

        return query;
    }

    readUnposted(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {

            var query = this._getQueryUnposted(_paging);

            this.collection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(PurchaseOrders => {
                    resolve(PurchaseOrders);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}

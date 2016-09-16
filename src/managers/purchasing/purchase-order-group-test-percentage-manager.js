'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;

// internal deps
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;
var PurchaseOrderTestPercentageManager = require('./purchase-order-test-percentage-manager');

module.exports = class PurchaseOrderGroupTestPercentageManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.PurchaseOrderGroupCollection = this.db.use(map.po.collection.PurchaseOrderGroup);
        this.purchaseOrderTestPercentageManager = new PurchaseOrderTestPercentageManager(db, user);
    }

    create(purchaseOrderGroup) {
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrderGroup)
                .then(validPurchaseOrderGroup => {
                    this.PurchaseOrderGroupCollection.insert(validPurchaseOrderGroup)
                        .then(id => {
                            var tasks = [];
                            for (var data of validPurchaseOrderGroup.items) {
                                var getPOItemById = this.purchaseOrderTestPercentageManager.getById(data._id);

                                Promise.all([getPOItemById])
                                    .then(result => {
                                        var poItem = result;
                                        poItem.PODLNo = validPurchaseOrderGroup.PODLNo
                                        poItem.supplier = validPurchaseOrderGroup.supplier;
                                        poItem.supplierId = validPurchaseOrderGroup.supplierId;
                                        poItem.paymentDue = validPurchaseOrderGroup.paymentDue;
                                        poItem.currency = validPurchaseOrderGroup.currency;
                                        poItem.deliveryDate = validPurchaseOrderGroup.deliveryDate;
                                        poItem.deliveryFeeByBuyer = validPurchaseOrderGroup.deliveryFeeByBuyer;
                                        poItem.standardQuality = validPurchaseOrderGroup.standardQuality;
                                        poItem.otherTest = validPurchaseOrderGroup.otherTest;
                                        tasks.push(this.purchaseOrderTestPercentageManager.update(poItem));
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

            if (valid.standardQuality) {
                var itemError = {};
                if (!valid.standardQuality.shrinkage || valid.standardQuality.shrinkage == '' || valid.standardQuality.shrinkage == 0)
                    itemError["shrinkage"] = "Shringkage tidak boleh kosong";
                if (!valid.standardQuality.wetRubbing || valid.standardQuality.wetRubbing == '' || valid.standardQuality.wetRubbing == 0)
                    itemError["wetRubbing"] = "Wet Rubbing tidak boleh kosong";
                if (!valid.standardQuality.dryRubbing || valid.standardQuality.dryRubbing == '' || valid.standardQuality.dryRubbing == 0)
                    itemError["dryRubbing"] = "Dry Rubbing tidak boleh kosong";
                if (!valid.standardQuality.washing || valid.standardQuality.washing == '' || valid.standardQuality.washing == 0)
                    itemError["washing"] = "Washing tidak boleh kosong";
                if (!valid.standardQuality.darkPrespiration || valid.standardQuality.darkPrespiration == '' || valid.standardQuality.darkPrespiration == 0)
                    itemError["darkPrespiration"] = "Dark Prespiration tidak boleh kosong";
                if (!valid.standardQuality.lightMedPrespiration || valid.standardQuality.lightMedPrespiration == '' || valid.standardQuality.lightMedPrespiration == 0)
                    itemError["lightMedPrespiration"] = "Light Prespiration tidak boleh kosong";

                if (Object.getOwnPropertyNames(itemError).length > 0)
                    errors["standardQuality"] = itemError;
            }

            if (!valid.PODLNo || valid.PODLNo == '')
                errors["PODLNo"] = "Nomor PODL tidak boleh kosong";

            if (valid.supplier) {
                if (!valid.supplierId || valid.supplierId == '')
                    errors["supplierId"] = "Nama Supplier tidak terdaftar";
            }
            else
                errors["supplierId"] = "Nama Supplier tidak boleh kosong";

            if (!valid.deliveryDate || valid.deliveryDate == '')
                errors["deliveryDate"] = "Tanggal Kirim tidak boleh kosong";
            if (!valid.termOfPayment || valid.termOfPayment == '')
                errors["termOfPayment"] = "Pembayaran tidak boleh kosong";
            if (!valid.paymentDue || valid.paymentDue == '')
                errors["paymentDue"] = "Tempo Pembayaran tidak boleh kosong";
            if (valid.deliveryFeeByBuyer == undefined || valid.deliveryFeeByBuyer.toString() === '')
                errors["deliveryFeeByBuyer"] = "Pilih salah satu ongkos kirim";

            if (valid.items.length > 0) {
                var itemErrors = [];
                for (var item of valid.items) {
                    var itemError = {};

                    if (valid.usePPn == undefined || valid.usePPn.toString() === '')
                        itemError["usePPn"] = "Pengenaan PPn harus dipilih";
                    if (valid.usePPh == undefined || valid.usePPh.toString() === '')
                        itemError["usePPh"] = "Pengenaan PPh harus dipilih";
                    itemErrors.push(itemError);
                }
                for (var itemError of itemErrors) {
                    for (var prop in itemError) {
                        errors.items = itemErrors;
                        break;
                    }
                    if (errors.items)
                        break;
                }

            }
            else if (valid.items.length <= 0) {
                errors["items"] = "Harus ada minimal 1 nomor PO";
            }

            // 2c. begin: check if data has any error, reject if it has.
            for (var prop in errors) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data podl does not pass validation', errors));
            }

            if (!valid.stamp)
                valid = new PurchaseOrderGroup(valid);

            valid.stamp(this.user.username, 'manager');
            resolve(valid);

        });
    }
    
    update(purchaseOrderGroup) {
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrderGroup)
                .then(validPurchaseOrderGroup => {
                    this.PurchaseOrderGroupCollection.update(validPurchaseOrderGroup)
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
}

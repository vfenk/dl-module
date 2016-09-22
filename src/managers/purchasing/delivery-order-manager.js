'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var BaseManager = require('../base-manager');

// internal deps 
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var DeliveryOrder = DLModels.purchasing.DeliveryOrder;
var PurchaseOrderManager = require('./purchase-order-manager');

// var PurchaseOrderBaseManager = require('../po/purchase-order-base-manager');
// var DOItem = DLModels.po.DOItem;

module.exports = class DeliveryOrderManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.purchasing.collection.DeliveryOrder);
        this.purchaseOrderManager = new PurchaseOrderManager(db, user);
    }

    _getQuery(paging) {
        var deleted = {
            _deleted: false
        };
        var query = paging.keyword ? {
            '$and': [deleted]
        } : deleted;

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filteNO = {
                'no': {
                    '$regex': regex
                }
            };
            var filterNRefNo = {
                'refNo': {
                    '$regex': regex
                }
            };
            var filterSupplierName = {
                'supplier.name': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filteNO, filterNRefNo, filterSupplierName]
            };

            query['$and'].push($or);
        }
        return query;
    }

    post(deliveryOrder) {
        return new Promise((resolve, reject) => {
            this._validate(deliveryOrder)
                .then(validDeliveryOrder => {
                    validDeliveryOrder.isPosted = true;
                    this.collection.update(validDeliveryOrder)
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
        });
    }

    _validate(deliveryOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = deliveryOrder;
            var now = new Date();

            if (!valid.no || valid.no == '')
                errors["no"] = "Nomor surat jalan tidak boleh kosong";

            if (!valid.date || valid.date == '')
                errors["date"] = "Tanggal surat jalan tidak boleh kosong";
            else if (valid.date > now)
                errors["SJDate"] = "Tanggal surat jalan tidak boleh lebih besar dari tanggal hari ini";

            if (!valid.supplierId || valid.supplierId.toString() == '')
                errors["supplier"] = "Nama supplier tidak boleh kosong";

            if (valid.items && valid.items.length < 1) {
                errors["items"] = "Harus ada minimal 1 nomor po eksternal";
            } else {
                var deliveryOrderItemErrors = [];
                var deliveryOrderItemHasError = false;
                for (var doItem of valid.items || []) {
                    var purchaseOrderExternalItemErrors = [];
                    var purchaseOrderExternalItemHasErrors = false;
                    var purchaseOrderExternalError = {};

                    if (!doItem.purchaseOrderExternal) {
                        purchaseOrderExternalItemHasErrors = true;
                        purchaseOrderExternalError["purchaseOrderExternal"] = "Purchase order external tidak boleh kosong";
                    }

                    for (var doFulfillment of doItem.fulfillments || []) {
                        var fulfillmentError = {};
                        if (!doFulfillment.deliveredQuantity || doFulfillment.deliveredQuantity == 0) {
                            purchaseOrderExternalItemHasErrors = true;
                            fulfillmentError["deliveredQuantity"] = "Jumlah barang diterima tidak boleh kosong";
                        }
                        else if (doFulfillment.deliveredQuantity > doFulfillment.purchaseOrderQuantity) {
                            purchaseOrderExternalItemHasErrors = true;
                            fulfillmentError["deliveredQuantity"] = "Jumlah barang diterima tidak boleh lebih besar dari jumlah barnag di po eksternal";
                        }
                        purchaseOrderExternalItemErrors.push(fulfillmentError);
                    }
                    if (purchaseOrderExternalItemHasErrors) {
                        deliveryOrderItemHasError = true;
                        purchaseOrderExternalError["fulfillments"] = purchaseOrderExternalItemErrors;
                    }
                    deliveryOrderItemErrors.push(purchaseOrderExternalError);
                }
                if (purchaseOrderExternalItemHasErrors)
                    errors["items"] = deliveryOrderItemErrors;
            }

            // 2c. begin: check if data has any error, reject if it has.
            for (var prop in errors) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data does not pass validation', errors));
            }

            if (!valid.stamp)
                valid = new DeliveryOrder(valid);

            valid.stamp(this.user.username, 'manager');
            resolve(valid);
        });
    }

    create(deliveryOrder) {
        return new Promise((resolve, reject) => {
            this._validate(deliveryOrder)
                .then(validDeliveryOrder => {
                    this.collection.insert(validDeliveryOrder)
                        .then(id => {
                            var tasks = [];
                            for (var validDeliveryOrderItem of validDeliveryOrder.items) {
                                for (var fulfillmentItem of validDeliveryOrderItem.fulfillments) {
                                    var fulfillmentObj = {
                                        DOno: validDeliveryOrder.no,
                                        deliveredQuantity: fulfillmentItem.deliveredQuantity
                                    };

                                    var getPurchaseOrderById = this.purchaseOrderManager.getSingleById(fulfillmentItem.purchaseOrder._id);
                                    Promise.all([getPurchaseOrderById])
                                        .then(results => {
                                            for (var result of results) {
                                                var purchaseOrder = result;

                                                for (var poItem of purchaseOrder.items) {
                                                    var doItems = validDeliveryOrderItem.fulfillments;
                                                    for (var doItem of doItems) {
                                                        if (poItem.product._id == doItem.product._id) {
                                                            poItem.fulfillments.push(fulfillmentObj);

                                                            var totalRealize = 0;
                                                            for (var poItemFulfillment of poItem.fulfillments) {
                                                                totalRealize += poItemFulfillment.deliveredQuantity;
                                                            }
                                                            poItem.realizationQuantity = totalRealize;
                                                            break;
                                                        }
                                                    }
                                                }
                                                tasks.push(this.purchaseOrderManager.update(purchaseOrder));
                                            }
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                }
                                // var getPOItemById = this.purchaseOrderManager.getSingleById(data._id);
                                // Promise.all([getPOItemById])
                                //     .then(result => {
                                //         var poItem = result;
                                //         poItem.purchaseOrderExternalId = validDeliveryOrder._id;
                                //         poItem.purchaseOrderExternal = validDeliveryOrder;
                                //         poItem.supplierId = validDeliveryOrder.supplierId;
                                //         poItem.supplier = validDeliveryOrder.supplier;
                                //         poItem.freightCostBy = validDeliveryOrder.freightCostBy;
                                //         poItem.paymentMethod = validDeliveryOrder.paymentMethod;
                                //         poItem.paymentDueDays = validDeliveryOrder.paymentDueDays;
                                //         poItem.useVat = validDeliveryOrder.useVat;
                                //         poItem.vatRate = validDeliveryOrder.vatRate;
                                //         poItem.useIncomeTax = validDeliveryOrder.useIncomeTax;
                                //         tasks.push(this.purchaseOrderManager.update(poItem));
                                //     })
                                //     .catch(e => {
                                //         reject(e);
                                //     })
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








}
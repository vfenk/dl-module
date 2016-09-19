'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var BaseManager = require('../base-manager');

// internal deps 
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var DeliveryOrder = DLModels.purchasing.DeliveryOrder;

// var PurchaseOrderBaseManager = require('../po/purchase-order-base-manager');
// var DOItem = DLModels.po.DOItem;

module.exports = class DeliveryOrderManager extends BaseManager { 
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.purchasing.collection.DeliveryOrder);
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
                '$or': [filteNO, filterNRefNo,filterSupplierName]
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

            var getDeliveryOrderPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        no: valid.no
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getDeliveryOrderPromise])
                .then(results => {
                    var _module = results[0];
                    var now = new Date();
                    if (_module) {
                        if (_module.supplier.name == valid.supplier.name)
                            errors["no"] = "Nomor surat jalan sudah terdaftar";
                    }
                    else if (!valid.no || valid.no == '')
                        errors["no"] = "Nomor surat jalan tidak boleh kosong";

                    if (!valid.date || valid.date == '')
                        errors["date"] = "Tanggal surat jalan tidak boleh kosong";
                    else if (valid.date > now)
                        errors["SJDate"] = "Tanggal surat jalan tidak boleh lebih besar dari tanggal hari ini";

                    // if (!valid.productArriveDate || valid.productArriveDate == '')
                    //     errors["productArriveDate"] = "Tanggal datang barang tidak boleh kosong";
                    // else if (valid.productArriveDate > now)
                    //     errors["productArriveDate"] = "Tanggal datang barang tidak boleh lebih besar dari tanggal hari ini";
                    // else if (valid.productArriveDate < valid.SJDate)
                    //     errors["productArriveDate"] = "Tanggal datang barang tidak boleh lebih kecil dari tanggal surat jalan";

                    if (!valid.supplierId)
                        errors["supplierId"] = "SupplierId tidak boleh kosong";
                    if (!valid.supplier.name || valid.supplier.name == '')
                        errors["supplier"] = "Supplier tidak boleh kosong";

                    // if (!valid.deliveryType || valid.deliveryType == '')
                    //     errors["deliveryType"] = "Jenis Pengiriman tidak boleh kosong";

                    // if (valid.deliveryType != 'Lokal')
                    //     if (!valid.deliveryNo || valid.deliveryNo == '')
                    //         errors["deliveryNo"] = "Nomor Penggiriman tidak boleh kosong";

                    // if (valid.items.length > 0) {
                    //     var itemErrors = [];
                    //     for (var item of valid.items) {
                    //         var itemError = {};

                    //         if (poItem.dealQuantity < poItem.realizationQuantity)
                    //             itemError["realizationQuantity"] = "Jumlah barang di SJ tidak boleh lebih besar dari jumlah barang di PO"
                    //         itemErrors.push(itemError);
                    //     }
                    //     for (var itemError of itemErrors) {
                    //         for (var prop in itemError) {
                    //             errors.items = itemErrors;
                    //             break;
                    //         }
                    //         if (errors.items)
                    //             break;
                    //     }

                    // }
                    // else 
                    if (valid.items.length <= 0) {
                        errors["items"] = "Harus ada minimal 1 nomor PO";
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
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

     

     

     

     

    
}
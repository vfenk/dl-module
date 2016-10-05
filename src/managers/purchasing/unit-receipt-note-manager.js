'use strict'
var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var assert = require('assert');
var map = DLModels.map;

var UnitReceiptNote = DLModels.purchasing.UnitReceiptNote;
var BaseManager = require('../base-manager');

module.exports = class UnitReceiptNoteManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.purchasing.collection.UnitReceiptNote);
    }

    _validate(unitReceiptNote) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = unitReceiptNote;

            var getUnitReceiptNotePromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        "no": valid.no
                    }]
            });

            Promise.all([getUnitReceiptNotePromise])
                .then(results => {
                    var _module = results[0];
                    var now = new Date();

                    if (!valid.no || valid.no == '')
                        errors["no"] = "No. bon unit tidak boleh kosong";
                    else if (_module)
                        errors["no"] = "No. bon unit sudah terdaftar";

                    if (!valid.unitId)
                        errors["unit"] = "Unit tidak boleh kosong";
                    else if (valid.unit) {
                        if (!valid.unit._id)
                            errors["unit"] = "Unit tidak boleh kosong";
                    }
                    else if (!valid.unit)
                        errors["unit"] = "Nama supplier tidak boleh kosong";

                    if (!valid.supplierId)
                        errors["supplier"] = "Nama supplier tidak boleh kosong";
                    else if (valid.supplier) {
                        if (!valid.supplier._id)
                            errors["supplier"] = "Nama supplier tidak boleh kosong";
                    }
                    else if (!valid.supplier)
                        errors["supplier"] = "Nama supplier tidak boleh kosong";

                    if (!valid.deliveryOrderId)
                        errors["deliveryOrder"] = "No. surat jalan tidak boleh kosong";
                    else if (valid.deliveryOrder) {
                        if (!valid.deliveryOrder._id)
                            errors["deliveryOrder"] = "No. surat jalan tidak boleh kosong";
                    }
                    else if (!valid.deliveryOrder)
                        errors["deliveryOrder"] = "No. surat jalan tidak boleh kosong";

                    if (valid.items.length <= 0) {
                        errors["items"] = "Harus ada minimal 1 barang";
                    }
                    else {
                        var itemErrors = [];
                        for (var item of valid.items) {
                            var itemError = {};
                            if (item.deliveredQuantity < 0)
                                itemError["deliveredQuantity"] = "Jumlah barang tidak boleh kosong";
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

                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }


                    if (!valid.stamp)
                        valid = new UnitReceiptNote(valid);

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })

        });
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

            var filterNo = {
                'no': {
                    '$regex': regex
                }
            };

            var filterSupplierName = {
                'supplier.name': {
                    '$regex': regex
                }
            };

            var filterUnitDivision = {
                "unit.division": {
                    '$regex': regex
                }
            };
            var filterUnitSubDivision = {
                "unit.subDivision": {
                    '$regex': regex
                }
            };

            var filterDeliveryOrder = {
                "deliveryOrder.no": {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterNo, filterSupplierName, filterUnitDivision, filterUnitSubDivision, filterDeliveryOrder]
            };

            query['$and'].push($or);
        }
        return query;
    }

    create(unitReceiptNote) {
        return new Promise((resolve, reject) => {
            var tasks = [];
            var tasksPoExternal = [];
            var getPurchaseOrderById = [];
            this._validate(unitReceiptNote)
                .then(validUnitReceiptNote => {
                    validUnitReceiptNote.unitId = new ObjectId(validUnitReceiptNote.unitId);
                    validUnitReceiptNote.supplierId = new ObjectId(validUnitReceiptNote.supplierId);
                    validUnitReceiptNote.deliveryOrderId = new ObjectId(validUnitReceiptNote.deliveryOrderId);
                    this.collection.insert(validUnitReceiptNote)
                        .then(id => {
                            resolve(id);
                            //update PO Internal
                            // for (var doItem of validUnitReceiptNoteItem.deliveryOrder.items) {
                            //     for (var fulfillment of doItem.fulfillments)
                            //         getPurchaseOrderById.push(this.purchaseOrderManager.getSingleById(fulfillment.purchaseOrder._id));
                            // }
                            // Promise.all(getPurchaseOrderById)
                            //     .then(results => {
                            //         for (var result of results) {
                            //             var purchaseOrder = result;
                            //             for (var poItem of purchaseOrder.items) {
                            //                 for (var unitReceiptNoteItem of validUnitReceiptNote.items) {
                            //                     if (validUnitReceiptNote.unitId.equals(purchaseOrder.unitId)) {
                            //                         if (unitReceiptNoteItem.product._id.equals(poItem.product._id)) {
                            //                             for (var fulfillment of poItem.fulfillments) {
                            //                                 if (fulfillment.no.equals(validUnitReceiptNoteItem.deliveryOrder.no)) {
                            //                                     fulfillment.unitReceiptNoteNo = validUnitReceiptNoteItem.no;
                            //                                     fulfillment.unitReceiptNoteDate = validUnitReceiptNoteItem.date;
                            //                                     fulfillment.unitReceiptNoteDeliveredQuantity = unitReceiptNoteItem.deliveredQuantity;
                            //                                     fulfillment.unitReceiptDeliveredUom = unitReceiptNoteItem.deliveredUom;
                            //                                 }
                            //                             }
                            //                         }
                            //                     }
                            //                 }
                            //             }
                            //             tasks.push(this.purchaseOrderManager.update(purchaseOrder));
                            //         }

                            //         Promise.all(tasks)
                            //             .then(results => {
                            //                 resolve(id);
                            //             })
                            //             .catch(e => {
                            //                 reject(e);
                            //             })

                            //     })
                            //     .catch(e => {
                            //         reject(e);
                            //     });
                            // for (var validUnitReceiptNoteItem of validUnitReceiptNote.items) {
                            //     for (var doItem of validUnitReceiptNoteItem.deliveryOrder.items) {
                            //         for (var fulfillment of doItem.fulfillments)
                            //             getPurchaseOrderById.push(this.purchaseOrderManager.getSingleById(fulfillment.purchaseOrder._id));
                            //     }
                            //     Promise.all(getPurchaseOrderById)
                            //         .then(results => {
                            //             for (var result of results) {
                            //                 var purchaseOrder = result;
                            //                 for (var poItem of purchaseOrder.items) {
                            //                     var doItems = validUnitReceiptNoteItem.fulfillments;
                            //                     for (var doItem of doItems) {
                            //                         if (purchaseOrder._id == doItem.purchaseOrder._id && poItem.product._id == doItem.product._id) {

                            //                             var fulfillmentObj = {
                            //                                 no: validUnitReceiptNote.no,
                            //                                 deliveredQuantity: doItem.deliveredQuantity,
                            //                                 date: validUnitReceiptNote.date,
                            //                                 supplierDoDate: validUnitReceiptNote.supplierDoDate
                            //                             };
                            //                             poItem.fulfillments.push(fulfillmentObj);

                            //                             var totalRealize = 0;
                            //                             for (var poItemFulfillment of poItem.fulfillments) {
                            //                                 totalRealize += poItemFulfillment.deliveredQuantity;
                            //                             }
                            //                             poItem.realizationQuantity = totalRealize;
                            //                             if (poItem.realizationQuantity == poItem.pricePerDealUnit)
                            //                                 poItem.isClosed = true;
                            //                             else
                            //                                 poItem.isClosed = false;
                            //                             break;
                            //                         }
                            //                     }
                            //                 }
                            //                 for (var poItem of purchaseOrder.items) {
                            //                     if (poItem.isClosed == true)
                            //                         purchaseOrder.isClosed = true;
                            //                     else {
                            //                         purchaseOrder.isClosed = false;
                            //                         break;
                            //                     }
                            //                 }
                            //                 tasks.push(this.purchaseOrderManager.update(purchaseOrder));
                            //             }

                            //             Promise.all(tasks)
                            //                 .then(results => {
                            //                     //update PO Eksternal
                            //                     for (var validDeliveryOrderItem of validUnitReceiptNote.items) {
                            //                         var purchaseOrderExternal = validDeliveryOrderItem.purchaseOrderExternal;
                            //                         var getPurchaseOrderById = [];
                            //                         for (var purchaseOrderExternalItem of purchaseOrderExternal.items) {
                            //                             // var indexPO = purchaseOrderExternal.items.indexOf(purchaseOrderExternalItem);
                            //                             getPurchaseOrderById.push(this.purchaseOrderManager.getSingleById(purchaseOrderExternalItem._id));
                            //                         }
                            //                         Promise.all(getPurchaseOrderById)
                            //                             .then(results => {
                            //                                 for (var result of results) {
                            //                                     if (result.isClosed == true)
                            //                                         purchaseOrderExternal.isClosed = true;
                            //                                     else {
                            //                                         purchaseOrderExternal.isClosed = false;
                            //                                         break;
                            //                                     }
                            //                                 }
                            //                                 purchaseOrderExternal.items = results;
                            //                                 tasksPoExternal.push(this.purchaseOrderExternalManager.update(purchaseOrderExternal));
                            //                             })
                            //                             .catch(e => {
                            //                                 reject(e);
                            //                             });

                            //                     }

                            //                     Promise.all(tasksPoExternal)
                            //                         .then(results => {
                            //                             resolve(id);
                            //                         })
                            //                         .catch(e => {
                            //                             reject(e);
                            //                         })
                            //                 })
                            //                 .catch(e => {
                            //                     reject(e);
                            //                 })

                            //         })
                            //         .catch(e => {
                            //             reject(e);
                            //         });
                            // }

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
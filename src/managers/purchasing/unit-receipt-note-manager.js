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
                        if (valid.unit._id)
                            errors["unit"] = "Unit tidak boleh kosong";
                    }
                    else if (!valid.unit)
                        errors["unit"] = "Nama supplier tidak boleh kosong";

                    if (!valid.supplierId)
                        errors["supplier"] = "Nama supplier tidak boleh kosong";
                    else if (valid.supplier) {
                        if (valid.supplier._id)
                            errors["supplier"] = "Nama supplier tidak boleh kosong";
                    }
                    else if (!valid.supplier)
                        errors["supplier"] = "Nama supplier tidak boleh kosong";

                    if (!valid.deliveryOrderId)
                        errors["deliveryOrder"] = "No. surat jalan tidak boleh kosong";
                    else if (valid.deliveryOrder) {
                        if (valid.deliveryOrder._id)
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
                        if (Object.getOwnPropertyNames(itemErrors).length > 0) {
                            errors.items = itemErrors;
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


}
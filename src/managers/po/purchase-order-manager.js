'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PO = DLModels.po.PurchaseOrder;

module.exports = class PurchaseOrderManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.PurchaseOrderCollection = this.db.use(map.po.collection.PurchaseOrder);
    }

    getDataPO(unit, category, PODLNo, PRNo, supplierId, dateFrom, dateTo) {
        return new Promise((resolve, reject) => {
            var query;
            if (unit == "undefined" && category == "undefined" && PODLNo == "undefined" && PRNo == "undefined" && supplierId == "undefined" && dateFrom == "undefined" && dateTo == "undefined") {
                query = {
                    _deleted: false
                };
            } else if (unit != "undefined" && category != "undefined" && PODLNo != "undefined" && PRNo != "undefined" && supplierId != "undefined" && dateFrom != "undefined" && dateTo != "undefined") {
                query = {
                    unit: unit,
                    category: category,
                    PODLNo: PODLNo,
                    PRNo: PRNo,
                    supplierId: supplierId,
                    PODate:
                    {
                        $gte: dateFrom,
                        $lte: dateTo
                    },
                    _deleted: false
                };
            } else if (unit != "undefined" && category != "undefined" && PODLNo != "undefined" && PRNo != "undefined" && supplierId != "undefined") {
                query = {
                    unit: unit,
                    category: category,
                    PODLNo: PODLNo,
                    PRNo: PRNo,
                    supplierId: supplierId,
                    _deleted: false
                };
            } else if (unit != "undefined" && category != "undefined" && PODLNo != "undefined" && PRNo != "undefined") {
                query = {
                    unit: unit,
                    category: category,
                    PODLNo: PODLNo,
                    PRNo: PRNo,
                    _deleted: false
                };
            } else if (unit != "undefined" && category != "undefined" && PODLNo != "undefined") {
                query = {
                    unit: unit,
                    category: category,
                    PODLNo: PODLNo,
                    _deleted: false
                };
            } else if (unit != "undefined" && category != "undefined") {
                query = {
                    unit: unit,
                    category: category,
                    _deleted: false
                };
            } else
                if (unit != "undefined") {
                    query = {
                        unit: unit,
                        _deleted: false
                    };
                }
                else if (category != "undefined") {
                    query = {
                        category: category,
                        _deleted: false
                    };
                } else if (PODLNo != "undefined") {
                    query = {
                        PODLNo: PODLNo,
                        _deleted: false
                    };
                } else if (PRNo != "undefined") {
                    query = {
                        PRNo: PRNo,
                        _deleted: false
                    };
                } else if (supplierId != "undefined") {
                    query = {
                        supplierId: supplierId,
                        _deleted: false
                    };
                } else if (dateFrom != "undefined" && dateTo != "undefined") {
                    query = {
                        PODate:
                        {
                            $gte: dateFrom,
                            $lte: dateTo
                        },
                        _deleted: false
                    };
                }
            this.PurchaseOrderCollection
                .where(query)
                .execute()
                .then(PurchaseOrder => {
                    resolve(PurchaseOrder);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    create(purchaseOrder) {
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.PurchaseOrderCollection.insert(validPurchaseOrder)
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

    update(purchaseOrder) {
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.PurchaseOrderCollection.update(validPurchaseOrder)
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
    
    delete(purchaseOrder) {
        return new Promise((resolve, reject) => {
            purchaseOrder._deleted = true;
                this.PurchaseOrderCollection.update(purchaseOrder)
                    .then(id => {
                        resolve(id);
                    })
                    .catch(e => {
                        reject(e);
                    });
        });
    }

    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            if (!valid.RefPONo || valid.RefPONo == '')
                errors["RefPONo"] = "Nomor Referensi PO tidak boleh kosong";

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

    _validatePO(purchaseOrder, errors) {
        var valid = purchaseOrder;

        if (!valid.RefPONo || valid.RefPONo == '')
            errors["RefPONo"] = "Nomor Referensi PO tidak boleh kosong";

        return errors;
    }

}
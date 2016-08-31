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
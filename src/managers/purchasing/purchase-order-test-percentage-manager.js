'use strict'

var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;
var PurchaseOrder = DLModels.po.PurchaseOrder;
var generateCode = require('../../utils/code-generator');
var PurchaseOrderBaseManager = require('./purchase-order-base-manager');

module.exports = class PurchaseOrderTestPercentageManager extends PurchaseOrderBaseManager  {
    constructor(db, user) {
        super(db, user);
        var PurchaseOrderManager = require("./purchase-order-manager");
        this.purchaseOrderManager = new PurchaseOrderManager(db, user);
    }
    
    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;
            
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
                
                if(Object.getOwnPropertyNames(itemError).length > 0)
                    errors["standardQuality"] = itemError;
            }
            
            if(valid.buyer.name)
            {
                if(!valid.buyer._id || valid.buyer._id.toString()=='')
                    errors["buyer"] = "Nama Buyer tidak boleh kosong";
            }
            
            if(valid.supplier.name)
            {
                if(!valid.supplier._id || valid.supplier._id.toString()=='')
                    errors["supplier"] = "Nama Supplier tidak boleh kosong";
            }
            
            if (!valid.PRNo || valid.PRNo == '')
                errors["PRNo"] = "Nomor PR tidak boleh kosong";

            if (!valid.unit || valid.unit == '')
                errors["unit"] = "Nama unit yang mengajukan tidak boleh kosong";

             if (!valid.PRDate || valid.PRDate == '')
                errors["PRDate"] = "Tanggal PR tidak boleh kosong";

            if (!valid.category || valid.category == '')
                errors["category"] = "Kategori tidak boleh kosong";

            if (!valid.staffName || valid.staffName == '')
                errors["staffName"] = "Nama staff pembelian yang menerima PR tidak boleh kosong";

            if (!valid.receivedDate || valid.receivedDate == '' )
                errors["receiveDate"] = "Tanggal terima PR tidak boleh kosong";

            if (valid.items.length > 0) {
                var itemErrors = [];
                for (var item of valid.items) {
                    var itemError = {};
                    
                    if (!item.dealQuantity || item.dealQuantity == 0 || item.dealQuantity == '')
                        itemError["dealQuantity"] = "Kwantum kesepakatan tidak boleh kosong";
                    if (!item.dealMeasurement || item.dealMeasurement == 0 || item.dealMeasurement == '')
                        itemError["dealMeasurement"] = "Satuan kesepakatan tidak boleh kosong";
                    if (!item.defaultQuantity || item.defaultQuantity == 0 || item.defaultQuantity == '')
                        itemError["defaultQuantity"] = "Kwantum tidak boleh kosong";
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
            else {
                errors["items"] = "Harus ada minimal 1 barang";
            }
            
            // this.purchaseOrderManager._validatePO(valid, errors); //refPONo tidak mandatory?

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
                        })
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    create(purchaseOrder) {
        purchaseOrder = new PurchaseOrder(purchaseOrder);
        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${generateCode()}`;
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

    split(purchaseOrder) {
        purchaseOrder = new PurchaseOrder(purchaseOrder);
        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${generateCode()}`;
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.create(validPurchaseOrder)
                        .then(id => {
                            this.getByPONo(validPurchaseOrder.linkedPONo).then(po => {
                                for (var item of validPurchaseOrder.items) {
                                    for (var product of po.items) {
                                        if (item.product.code == product.product.code) {
                                            product.dealQuantity = product.dealQuantity - item.dealQuantity
                                            product.defaultQuantity = product.defaultQuantity - item.defaultQuantity
                                            break;
                                        }
                                    }
                                }
                                this.update(po)
                                    .then(results => {
                                        resolve(id);
                                    })
                            })
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
}
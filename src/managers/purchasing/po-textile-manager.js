'use strict'

var PurchaseOrderBaseManager = require('./purchase-order-base-manager');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrder = DLModels.po.PurchaseOrder;

var generateCode = require('../../utils/code-generator');

var POTextile = DLModels.po.POTextile;

module.exports = class POTextileManager extends PurchaseOrderBaseManager {
    constructor(db, user) {
        super(db, user);
        this.moduleId = 'PT'
        this.poType = map.po.type.POTextile;
    }

    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            if (!valid.PRNo || valid.PRNo == '')
                errors["PRNo"] = "Nomor PR tidak boleh kosong";

            if (!valid.unit || valid.unit == '')
                errors["unit"] = "Nama unit yang mengajukan tidak boleh kosong";

             if (!valid.PRDate || valid.PRDate == ''|| valid.PRDate == undefined)
                errors["PRDate"] = "Tanggal PR tidak boleh kosong";

            if (!valid.category || valid.category == '')
                errors["category"] = "Kategori tidak boleh kosong";

            if (!valid.staffName || valid.staffName == '')
                errors["staffName"] = "Nama staff pembelian yang menerima PR tidak boleh kosong";

            if (!valid.receivedDate || valid.receivedDate == '' || valid.receivedDate == undefined)
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
            else if (valid.items.length <= 0) {
                errors["items"] = "Harus ada minimal 1 barang";
            }


            this.purchaseOrderManager._validatePO(valid, errors);

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

    _getQueryPurchaseOrder(_paging) {
        var filter = {
            _deleted: false,
            _type: this.poType
        };

        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterRONo = {
                'RONo': {
                    '$regex': regex
                }
            };
            var filterRefPONo = {
                'RefPONo': {
                    '$regex': regex
                }
            };
            var filterPONo = {
                'PONo': {
                    '$regex': regex
                }
            };
            var filterBuyerName = {
                'buyer.name': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterRONo, filterRefPONo, filterPONo, filterBuyerName]
            };

            query['$and'].push($or);
        }

        return query;
    }

    _getQueryPurchaseOrderPODL(_paging) {
        var filter = {
            _deleted: false,
            _type: this.poType,
            PODLNo: { '$ne': '' }
        };

        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterRefPONo = {
                'RefPONo': {
                    '$regex': regex
                }
            };
            var filterPONo = {
                'PONo': {
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

    _getQueryPurchaseOrdernoPODLBySupplier(_paging,supplier) {
        var filter = {
            _deleted: false,
            _type: this.poType,
            "supplier.name":supplier,
            PODLNo: ''
        };

        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterRefPONo = {
                'RefPONo': {
                    '$regex': regex
                }
            };
            var filterPONo = {
                'PONo': {
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

    _getQueryPurchaseOrderGroup(_paging) {
        var filter = {
            _deleted: false,
            _type: this.poType
        };

        var query = _paging.keyword ? {
            '$and': [filter]
        } : filter;

        if (_paging.keyword) {
            var regex = new RegExp(_paging.keyword, "i");
            var filterPODLNo = {
                'PODLNo': {
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

    create(purchaseOrder) {
        purchaseOrder = new POTextile(purchaseOrder);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${generateCode()}`;

            this._validate(purchaseOrder)
                .then(validPurchaseOrderc => {
                    this.purchaseOrderManager.create(validPurchaseOrderc)
                        .then(id => {
                            resolve(id);
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

    split(purchaseOrder) {
        purchaseOrder = new POTextile(purchaseOrder);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${generateCode()}`;

            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    this.purchaseOrderManager.create(validPurchaseOrder)
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
                                        // console.log(8);
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

    createGroup(purchaseOrderGroup) {

        purchaseOrderGroup.PODLNo = `PO/DL/${this.year}${generateCode()}`;
        purchaseOrderGroup._type = this.poType

        return new Promise((resolve, reject) => {
            this.purchaseOrderGroupManager.create(purchaseOrderGroup)
                .then(id => {

                    var tasks = [];
                    for (var data of purchaseOrderGroup.items) {
                        data.PODLNo = purchaseOrderGroup.PODLNo
                        data.supplier = purchaseOrderGroup.supplier;
                        data.supplierId = purchaseOrderGroup.supplierId;
                        data.paymentDue = purchaseOrderGroup.paymentDue;
                        data.currency = purchaseOrderGroup.currency;
                        data.usePPn = purchaseOrderGroup.usePPn;
                        data.usePPh = purchaseOrderGroup.usePPh;
                        data.deliveryDate = purchaseOrderGroup.deliveryDate;
                        data.deliveryFeeByBuyer = purchaseOrderGroup.deliveryFeeByBuyer;
                        data.standardQuality = purchaseOrderGroup.standardQuality;
                        data.otherTest = purchaseOrderGroup.otherTest;

                        tasks.push(this.update(data));
                    }

                    Promise.all(tasks)
                        .then(results => {
                            resolve(id);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    updateGroup(purchaseOrderGroup) {
        return new Promise((resolve, reject) => {
            this.purchaseOrderGroupManager.update(purchaseOrderGroup)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }
}
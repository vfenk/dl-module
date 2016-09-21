'use strict'

var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrder = DLModels.purchasing.PurchaseOrder;
var generateCode = require('../../utils/code-generator');
var BaseManager = require('../base-manager');

module.exports = class PurchaseOrderManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.moduleId = '';
        this.year = (new Date()).getFullYear().toString().substring(2, 4);
        this.collection = this.db.use(map.purchasing.collection.PurchaseOrder);
    }

    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            // if (!valid.buyerId || valid.buyerId.toString() == '')
            //     errors["buyer"] = "Nama Buyer tidak boleh kosong";

            if (valid.purchaseRequest) {
                var itemError = {};
                if (!valid.purchaseRequest.unit)
                    itemError["unit"] = "Nama unit yang mengajukan tidak boleh kosong";

                if (!valid.purchaseRequest.category)
                    itemError["category"] = "Kategori tidak boleh kosong";

                if (!valid.purchaseRequest.no)
                    itemError["no"] = "No. PR tidak boleh kosong";

                if (!valid.purchaseRequest.date)
                    itemError["date"] = "Tanggal PR tidak boleh kosong";

                if (!valid.purchaseRequest.expectedDeliveryDate)
                    itemError["expectedDeliveryDate"] = "Tanggal terima PR tidak boleh kosong";

                for (var prop in itemError) {
                    errors["purchaseRequest"] = itemError;
                    break;
                }
            }

            // if (!valid.expectedDeliveryDate || valid.expectedDeliveryDate == '')
            //     errors["expectedDeliveryDate"] = "Tanggal rencana kirim tidak boleh kosong";

            // if (!valid.actualDeliveryDate || valid.actualDeliveryDate == '')
            //     errors["actualDeliveryDate"] = "Tanggal kirim tidak boleh kosong";

            if (valid.items.length > 0) {
                var itemErrors = [];
                for (var item of valid.items) {
                    var itemError = {};

                    // if (!item.dealQuantity || item.dealQuantity == 0 || item.dealQuantity == '')
                    //     itemError["dealQuantity"] = "Jumlah kesepakatan tidak boleh kosong";
                    // if (!item.dealUom || item.dealUom == 0 || item.dealUom == '')
                    //     itemError["dealUom"] = "Jumlah kesepakatan tidak boleh kosong";
                    if (!item.defaultQuantity || item.defaultQuantity == 0 || item.defaultQuantity == '')
                        itemError["defaultQuantity"] = "Jumlah default tidak boleh kosong";
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

            for (var prop in errors) {
                var ValidationError = require('../../validation-error');
                reject(new ValidationError('data does not pass validation', errors));
            }

            if (valid.purchaseRequest) {
                valid.refNo = valid.purchaseRequest.no;
                valid.unit = valid.purchaseRequest.unit;
                valid.unitId = valid.purchaseRequest.unit._id;
                valid.category = valid.purchaseRequest.category;
                valid.categoryId = valid.purchaseRequest.category._id;
                valid.date = valid.purchaseRequest.date;
                valid.expectedDeliveryDate = valid.purchaseRequest.expectedDeliveryDate;
            }
            if (!valid.stamp)
                valid = new PurchaseOrder(valid);

            valid.stamp(this.user.username, 'manager');
            resolve(valid);
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
            var filterBuyerName = {
                'buyer.name': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterRefPONo, filterPONo, filterBuyerName]
            };

            query['$and'].push($or);
        }
        return query;
    }

    _getQueryNoPurchaseOrderExternal(_paging) {
        var filter = {
            _deleted: false,
            // purchaseOrderExternalId: {}
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

    readNoPurchaseOrderExternal(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {

            var query = this._getQueryNoPurchaseOrderExternal(_paging);

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

    create(purchaseOrder) {
        purchaseOrder = new PurchaseOrder(purchaseOrder);

        return new Promise((resolve, reject) => {
            purchaseOrder.no = `${this.moduleId}${this.year}${generateCode()}`;
            this._validate(purchaseOrder)
                .then(validPurchaseOrderc => {
                    this.collection.insert(validPurchaseOrderc)
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
        return new Promise((resolve, reject) => {
            this._validate(purchaseOrder)
                .then(validPurchaseOrder => {
                    delete validPurchaseOrder._id;
                    this.create(validPurchaseOrder)
                        .then(id => {
                            this.getSingleById(validPurchaseOrder.sourcePurchaseOrderId)
                                .then(sourcePo => {
                                    for (var item of validPurchaseOrder.items) {
                                        for (var sourceItem of sourcePo.items) {
                                            if (item.product.code == sourceItem.product.code) {
                                                sourceItem.defaultQuantity = sourceItem.defaultQuantity - item.defaultQuantity
                                                break;
                                            }
                                        }
                                    }

                                    sourcePo.items = sourcePo.items.filter((item, index) => {
                                        return item.defaultQuantity > 0;
                                    })

                                    this.update(sourcePo)
                                        .then(results => {
                                            resolve(id);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                })
                                .catch(e => {
                                    reject(e);
                                });
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

    _getByPR(_purchaseRequestNo) {
        return new Promise((resolve, reject) => {
            if (_purchaseRequestNo === '')
                resolve(null);
            var query = {
                "purchaseRequest.no": _purchaseRequestNo,
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}
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

            var getPurchaseOrderPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        "purchaseRequest.no": valid.purchaseRequest.no
                    }]
            });

            Promise.all([getPurchaseOrderPromise])
                .then(results => {
                    var _module = results[0];
                    var now = new Date();

                    if (valid.purchaseRequest) {
                        var itemError = {};
                        if (!valid.purchaseRequest.unit)
                            itemError["unit"] = "Nama unit yang mengajukan tidak boleh kosong";

                        if (!valid.purchaseRequest.category)
                            itemError["category"] = "Kategori tidak boleh kosong";

                        if (!valid.purchaseRequest.no)
                            itemError["no"] = "No. PR tidak boleh kosong";
                        else if (_module && valid.sourcePurchaseOrder== null)
                            itemError["no"] = "No. PR sudah terdaftar";
                         
                        if (!valid.purchaseRequest.date)
                            itemError["date"] = "Tanggal PR tidak boleh kosong";
                        else
                        {
                            var _prDate = new Date(valid.purchaseRequest.date);
                            if (_prDate > now)
                                itemError["date"] = "Tanggal PR tidak boleh lebih besar dari tanggal hari ini";
                        }

                        // if (!valid.purchaseRequest.expectedDeliveryDate)
                        //     itemError["expectedDeliveryDate"] = "Tanggal terima PR tidak boleh kosong";
                        if (valid.purchaseRequest.expectedDeliveryDate && valid.purchaseRequest.date)
                        {
                            var _prDate = new Date(valid.purchaseRequest.date);
                            var _expectedDate = new Date(valid.purchaseRequest.expectedDeliveryDate);
                            if(_prDate>_expectedDate)
                                itemError["expectedDeliveryDate"] = "Tanggal PR tidak boleh lebih besar dari tanggal tersedia";
                        }

                        for (var prop in itemError) {
                            errors["purchaseRequest"] = itemError;
                            break;
                        }
                    }

                    if (valid.items.length > 0) {
                        var itemErrors = [];
                        for (var item of valid.items) {
                            var itemError = {};

                            if (!item.product || !item.product._id)
                                itemError["product"] = "Nama barang tidak boleh kosong";
                            if (!item.defaultQuantity || item.defaultQuantity == 0)
                                itemError["defaultQuantity"] = "Jumlah default tidak boleh kosong";
                                
                            if(valid.sourcePurchaseOrder != null)
                            {
                                for(var sourcePoItem of valid.sourcePurchaseOrder.items)
                                {
                                    if(item.product._id && item.defaultQuantity)
                                    {
                                        if(item.product._id == sourcePoItem.product._id)
                                        {
                                            if(item.defaultQuantity > sourcePoItem.defaultQuantity)
                                            {
                                                itemError["defaultQuantity"] = "Jumlah default tidak boleh lebih besar dari PO asal";
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
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

    _getQueryUnposted(_paging) {
        var filter = {
            _deleted: false,
             purchaseOrderExternalId: {}
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

    readUnposted(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {

            var query = this._getQueryUnposted(_paging);

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

     getDataPOMonitoringPembelian(unitId, categoryId, PODLNo, PRNo, supplierId, dateFrom, dateTo) {
        return new Promise((resolve, reject) => {
            var query;
             if (unitId != "undefined" && unitId != ""  && categoryId != "undefined"  && categoryId !="" && PODLNo != "undefined"  && PODLNo !="" && PRNo != "undefined" && PRNo != "" && supplierId != "undefined" && supplierId !="" && dateFrom != "undefined" && dateFrom !="" && dateTo != "undefined" && dateTo !="") {
                query = {
                    unitId: unitId,
                    categoryId: categoryId,
                    PODLNo: PODLNo,
                    PRNo: PRNo,
                    supplierId: supplierId,
                    date:
                    {
                        $gte: dateFrom,
                        $lte: dateTo
                    },
                    _deleted: false
                };
            } else if (unitId != "undefined" && unitId != ""  && categoryId != "undefined"  && categoryId !="" && PODLNo != "undefined"  && PODLNo !="" && PRNo != "undefined" && PRNo != "" && supplierId != "undefined" && supplierId !="") {
                query = {
                    unitId: unitId,
                    categoryId: categoryId,
                    PODLNo: PODLNo,
                    PRNo: PRNo,
                    supplierId: supplierId,
                    _deleted: false
                };
            } else if (unitId != "undefined" && unitId != ""  && categoryId != "undefined"  && categoryId !="" && PODLNo != "undefined"  && PODLNo !="" && PRNo != "undefined" && PRNo != "") {
                query = {
                    unitId: unitId,
                    categoryId: categoryId,
                    PODLNo: PODLNo,
                    PRNo: PRNo,
                    _deleted: false
                };
            } else if (unitId != "undefined" && unitId != ""  && categoryId != "undefined"  && categoryId !="" && PODLNo != "undefined") {
                query = {
                    unitId: unitId,
                    categoryId: categoryId,
                    PODLNo: PODLNo,
                    _deleted: false
                };
            } else if (unitId != "undefined" && unitId != ""  && categoryId != "undefined"  && categoryId !="") {
                query = {
                    unitId: unitId,
                    categoryId: categoryId,
                    _deleted: false
                };
            } else
                if (unitId != "undefined" && unitId != "") {
                    query = {
                        unitId: unitId,
                        _deleted: false
                    };
                }
                else if (categoryId != "undefined" && categoryId !="") {
                    query = {
                        categoryId: categoryId,
                        _deleted: false
                    };
                } else if (PODLNo != "undefined" && PODLNo !="") {
                    query = {
                        PODLNo: PODLNo,
                        _deleted: false
                    };
                } else if (PRNo != "undefined" && PRNo !="") {
                    query = {
                        PRNo: PRNo,
                        _deleted: false
                    };
                } else if (supplierId != "undefined" && supplierId !="") {
                    query = {
                        supplierId: supplierId,
                        _deleted: false
                    };
                } else if (dateFrom != "undefined" && dateFrom !="" && dateTo != "undefined" && dateTo !="") {
                    query = {
                        date:
                        {
                            $gte: dateFrom,
                            $lte: dateTo
                        },
                        _deleted: false
                    };
                }
           this.collection
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
}
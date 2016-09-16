'use strict'

var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseOrderGroup = DLModels.po.PurchaseOrderGroup;
var PurchaseOrder = DLModels.po.PurchaseOrder;
var generateCode = require('../../utils/code-generator');
var BaseManager = require('../base-manager');

module.exports = class PurchaseOrderManager  extends BaseManager  {
    constructor(db, user) {
        super(db, user);
        
        this.poType = '';
        this.moduleId = '';
        this.year = (new Date()).getFullYear().toString().substring(2,4);
        
        this.collection = this.db.use(map.po.collection.PurchaseOrder);
    }

    _validate(purchaseOrder) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseOrder;

            if (valid.buyer.name) {
                if (!valid.buyer._id || valid.buyer._id.toString() == '')
                    errors["buyer"] = "Nama Buyer tidak boleh kosong";
            }

            if (valid.supplier.name) {
                if (!valid.supplier._id || valid.supplier._id.toString() == '')
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

            if (!valid.receivedDate || valid.receivedDate == '')
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
    
    _getQueryPurchaseOrderAll(_paging) {
        var filter = {
            _deleted: false
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
    
    _getQueryPurchaseOrder(_paging) {
        var filter = {
            _deleted: false,
            // unit:_unit,
            // category:_category
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
            var filterSupplierName = {
                'supplier.name': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterRONo, filterRefPONo, filterPONo, filterBuyerName,filterSupplierName]
            };

            query['$and'].push($or);
        }

        return query;
    }
    
    _getQueryPurchaseOrderHasPODL (_paging){
         var filter = {
            _deleted: false,
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
    
    _getQueryPurchaseOrdernoPODLbySupplier (supplier,_paging){
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
    
    readAll(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {

            var query = this._getQueryPurchaseOrderAll(_paging);

            this.PurchaseOrderCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(purchaseOrders => {
                    resolve(purchaseOrders);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    
    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {

            var query = this._getQueryPurchaseOrder(_paging);

            this.PurchaseOrderCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(purchaseOrders => {
                    resolve(purchaseOrders);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
    
    readPOhasPODL(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            
            var query = this._getQueryPurchaseOrderHasPODL(_paging);

            this.PurchaseOrderCollection
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
    
    readPOnoPODLbySupplier(supplier,paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            
            var query = this._getQueryPurchaseOrdernoPODLbySupplier(supplier,_paging);

            this.PurchaseOrderCollection
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

    delete(purchaseOrder) {
        return new Promise((resolve, reject) => {
            purchaseOrder._deleted = true;
            this.PurchaseOrderCollection.delete(purchaseOrder)
                .then(id => {
                    resolve(id);
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    getByPONo(poNo) {
        return new Promise((resolve, reject) => {
            if (poNo === '')
                resolve(null);
            var query = {
                PONo: poNo,
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
    
    getById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);

            var query = {
                _id: new ObjectId(id),
                _deleted: false,
                _type: this.poType
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

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.PurchaseOrderCollection
                .single(query)
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false,
                _type: this.poType
            };
            this.getSingleOrDefaultByQuery(query)
                .then(module => {
                    resolve(module);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleOrDefaultByQuery(query) {
        return new Promise((resolve, reject) => {
            this.PurchaseOrderCollection
                .singleOrDefault(query)
                .then(purchaseOrders => {
                    resolve(purchaseOrders);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }  
     
    create(purchaseOrder) {
        purchaseOrder = new PurchaseOrder(purchaseOrder);

        return new Promise((resolve, reject) => {
            purchaseOrder.PONo = `${this.moduleId}${this.year}${generateCode()}`;

            this._validate(purchaseOrder)
                .then(validPurchaseOrderc => {
                    this.PurchaseOrderCollection.insert(validPurchaseOrderc)
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
}
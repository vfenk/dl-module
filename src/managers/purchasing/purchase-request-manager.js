'use strict'

var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var PurchaseRequest = DLModels.purchasing.PurchaseRequest;
var generateCode = require('../../utils/code-generator');
var BaseManager = require('../base-manager');
var i18n = require('dl-i18n');

module.exports = class PurchaseRequestManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.moduleId = 'PR';
        this.year = (new Date()).getFullYear().toString().substring(2, 4);
        this.collection = this.db.use(map.purchasing.collection.PurchaseRequest);
    }

    _validate(purchaseRequest) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = purchaseRequest;

            var getPurchaseRequestPromise = this.collection.singleOrDefault({
                    
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                
            });

            Promise.all([getPurchaseRequestPromise])
                .then(results => {
                    var _module = results[0];
                    var now = new Date();

                    if (!valid.date || valid.date == '' || valid.date =="undefined")
                        errors["date"] = i18n.__("PurchaseRequest.date.isRequired:%s is required", i18n.__("PurchaseRequest.date._:Date"));//"Tanggal PR tidak boleh kosong";

                    if (!valid.unitId)
                        errors["unit"] = i18n.__("PurchaseRequest.unit.isRequired:%s is required", i18n.__("PurchaseRequest.unit._:Unit")); //"Unit tidak boleh kosong";
                    else if (valid.unit) {
                        if (!valid.unit._id)
                            errors["unit"] = i18n.__("PurchaseRequest.unit.isRequired:%s is required", i18n.__("PurchaseRequest.unit._:Unit")); //"Unit tidak boleh kosong";
                    }
                    else if (!valid.unit)
                        errors["unit"] =  i18n.__("PurchaseRequest.unit.isRequired:%s is required", i18n.__("PurchaseRequest.unit._:Unit")); //"Unit tidak boleh kosong";

                    
                    if (!valid.categoryId)
                        errors["category"] = i18n.__("PurchaseRequest.category.isRequired:%s is required", i18n.__("PurchaseRequest.category._:Category")); //"Category tidak boleh kosong";
                    else if (valid.category) {
                        if (!valid.category._id)
                            errors["category"] = i18n.__("PurchaseRequest.category.isRequired:%s is required", i18n.__("PurchaseRequest.category._:Category")); //"Category tidak boleh kosong";
                    }
                    else if (!valid.category)
                        errors["category"] =  i18n.__("PurchaseRequest.category.isRequired:%s is required", i18n.__("PurchaseRequest.category._:Category")); //"Category tidak boleh kosong";

                    if (!valid.budget || valid.budget.name=='')
                        errors["budget"] = i18n.__("PurchaseRequest.budget.name.isRequired:%s is required", i18n.__("PurchaseRequest.budget.name._:Budget")); //"Budget tidak boleh kosong";
                    
                    if (!valid.expectedDeliveryDate || valid.expectedDeliveryDate=='' || valid.expectedDeliveryDate=='undefined' )
                        valid.expectedDeliveryDate="";
                    
                    if (valid.items) {
                        if (valid.items.length <= 0) {
                            errors["items"] =  i18n.__("PurchaseRequest.items.isRequired:%s is required", i18n.__("PurchaseRequest.items._:Item")); //"Harus ada minimal 1 barang";
                        }
                        else {
                            var itemErrors = [];
                            for (var item of valid.items) {
                                var itemError = {};
                                 if (!item.product || !item.product._id)
                                itemError["product"] = i18n.__("PurchaseRequest.items.product.name.isRequired:%s is required", i18n.__("PurchaseRequest.items.product.name._:Name")); //"Nama barang tidak boleh kosong";
                                if (item.quantity <= 0)
                                    itemError["quantity"] = i18n.__("PurchaseRequest.items.quantity.isRequired:%s is required", i18n.__("PurchaseRequest.items.quantity._:Quantity")); //Jumlah barang tidak boleh kosong";
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
                    }
                    else {
                        errors["items"] = i18n.__("PurchaseRequest.items.isRequired:%s is required", i18n.__("PurchaseRequest.items._:Item")); //"Harus ada minimal 1 barang";
                    }

                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid.unitId = new ObjectId(valid.unitId);
                    valid.unit._id = new ObjectId(valid.unitId);
                    if (valid.category != null) {
                        valid.categoryId = new ObjectId(valid.category._id);
                        valid.category._id = new ObjectId(valid.category._id);
                    }
                    
                    if (!valid.stamp)
                        valid = new PurchaseRequest(valid);

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
            _deleted: false,
            _createdBy:this.user.username
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

            var filterCategory = {
                "category.name": {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterNo, filterUnitDivision, filterUnitSubDivision, filterCategory]
            };

            query['$and'].push($or);
        }
        return query;
    }

    create(purchaseRequest) {
        //purchaseRequest = new PurchaseRequest(purchaseRequest);
        return new Promise((resolve, reject) => {
            var dateFormat = "MMYY";
            var locale = 'id-ID';
            var moment = require('moment');
            moment.locale(locale);
            this._validate(purchaseRequest)
                .then(validPurchaseRequest => {
                    validPurchaseRequest.no = `${validPurchaseRequest.budget.code}${validPurchaseRequest.unit.code}${validPurchaseRequest.category.code}${moment(validPurchaseRequest.date).format(dateFormat)}${generateCode()}`;
                    if(validPurchaseRequest.expectedDeliveryDate=="undefined")
                    {
                        validPurchaseRequest.expectedDeliveryDate="";
                    }
                    this.collection.insert(validPurchaseRequest)
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

    post(listPurchaseRequest) {
        return new Promise((resolve, reject) => {
            for (var purchaseRequest of listPurchaseRequest) {
            this._validate(purchaseRequest)
                .then(validPurchaseRequest => {
                    validPurchaseRequest.isPosted = true;
                    this.collection.update(validPurchaseRequest)
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
            }
        });
        
    }

    pdf(id) {
        return new Promise((resolve, reject) => {

            this.getSingleById(id)
                .then(purchaseRequest => {
                    var getDefinition = require('../../pdf/definitions/purchase-request');
                    var definition = getDefinition(purchaseRequest);

                    var generatePdf = require('../../pdf/pdf-generator');
                    generatePdf(definition)
                        .then(binary => {
                            resolve(binary);
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

    getDataPRMonitoring(unitId, categoryId, budgetId, PRNo, dateFrom, dateTo) {
        return new Promise((resolve, reject) => {
            var sorting = {
                "date": -1,
                "no": 1
            };
            var query = {};
            if (unitId != "undefined" && unitId != "" && categoryId != "undefined" && categoryId != "" && budgetId != "undefined" && budgetId != "" && PRNo != "undefined" && PRNo != "" && dateFrom != "undefined" && dateFrom != "" && dateFrom != "null" && dateTo != "undefined" && dateTo != "" && dateTo != "null") {
                query = {
                    unitId: new ObjectId(unitId),
                    categoryId: new ObjectId(categoryId),
                    "no": PRNo,
                    "budget._id": new ObjectId(budgetId),
                    date:
                    {
                        $gte: dateFrom,
                        $lte: dateTo
                    }
                };
            } else if (unitId != "undefined" && unitId != "" && categoryId != "undefined" && categoryId != "" && budgetId != "undefined" && budgetId != "" && PRNo != "undefined" && PRNo != "") {
                query = {
                    unitId: new ObjectId(unitId),
                    categoryId: new ObjectId(categoryId),
                    "no": PRNo,
                    "budget._id": new ObjectId(budgetId)
                };
            } else if (unitId != "undefined" && unitId != "" && categoryId != "undefined" && categoryId != "" && budgetId != "undefined" && budgetId != "") {
                query = {
                    unitId: new ObjectId(unitId),
                    categoryId: new ObjectId(categoryId),
                    "budget._id": new ObjectId(budgetId)
                };
            } else if (unitId != "undefined" && unitId != "" && categoryId != "undefined" && categoryId != "" ) {
                query = {
                    unitId: new ObjectId(unitId),
                    categoryId: new ObjectId(categoryId)
                };
            } else if (unitId != "undefined" && unitId != "") {
                    query = {
                        unitId: new ObjectId(unitId)
                    };
                }
                else if (categoryId != "undefined" && categoryId != "") {
                    query = {
                        categoryId: new ObjectId(categoryId)
                    };
                } else if (budgetId != "undefined" && budgetId != "") {
                    query = {
                        "budget._id": budgetId
                    };
                }else if (PRNo != "undefined" && PRNo != "") {
                    query = {
                        "no": PRNo
                    };
                    console.log(query);
                } else if (dateFrom != "undefined" && dateFrom != "" && dateFrom != "null" && dateTo != "undefined" && dateTo != "" && dateTo != "null") {
                    query = {
                        date:
                        {
                            $gte: dateFrom,
                            $lte: dateTo
                        }
                    };
                }
            query = Object.assign(query, {
                _createdBy: this.user.username,
                _deleted: false
            });
            this.collection.find(query).sort(sorting).toArray()
                .then(purchaseRequest => {
                    resolve(purchaseRequest);
                    console.log(purchaseRequest);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }
}
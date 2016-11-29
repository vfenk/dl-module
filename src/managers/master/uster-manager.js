'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var UsterClassification = DLModels.master.UsterClassification;
var Uster = DLModels.master.Uster;
var ProductManager = require('./product-manager');
var CodeGenerator = require('../../utils/code-generator');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');

module.exports = class UsterManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.collection(map.master.collection.Uster);
        this.productManager = new ProductManager(db, user);
    }

    _getQuery(paging) {
        var deletedFilter = {
            _deleted: false
        }, keywordFilter = {};

        var query = {};
        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterProductCode = {
                'product.code': {
                    '$regex': regex
                }
            };
            var filterProductName = {
                'product.name': {
                    '$regex': regex
                }
            };
            keywordFilter = {
                '$or': [filterCode, filterProductCode, filterProductName]
            };
        }

        query = { '$and': [deletedFilter, paging.filter, keywordFilter] };
        return query;
    }

    _validate(uster) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = uster;
            var now = new Date();
            // 1. begin: Declare promises.
            var getUster = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    _deleted: false
                }, {
                    productId: valid.product && ObjectId.isValid(valid.product._id) ? (new ObjectId(valid.product._id)) : ''
                }]
            });
            var getProduct = valid.product && ObjectId.isValid(valid.product._id) ? this.productManager.getSingleByIdOrDefault(valid.product._id) : Promise.resolve(null);
            // 2. begin: Validation.
            Promise.all([getUster, getProduct])
                .then(result => {
                    var _uster = result[0];
                    var _product = result[1];

                    if (!_product)
                        errors["product"] = i18n.__("Uster.product.isNotExists:%s is not exists", i18n.__("Uster.product._:Product")); //"Benang sudah tidak ada di master produk";
                    else if (_uster)
                        errors["product"] = i18n.__("Uster.product.isNotExists:%s is exists in other uster", i18n.__("Uster.product._:Product")); //"Benang sudah tidak ada di master produk";


                    if (valid.classifications && valid.classifications.length > 0) {
                        var classificationError = [];
                        var classificationHasError = false;
                        for (var a of valid.classifications || []) {
                            if (!a.grade || a.grade == '') {
                                classificationHasError = true;
                                classificationError["grade"] = i18n.__("Uster.classifications.grade.isRequired:%s is required", i18n.__("Uster.classifications.grade._:Grade"));
                            }
                        }
                        if (classificationHasError)
                            errors["classifications"] = classificationError;
                    } else
                        errors["classifications"] = i18n.__("Uster.classifications.isRequired:%s is required", i18n.__("Uster.classifications._:Classifications")); //"Harus ada minimal 1 klasifikasi";

                    // 2c. begin: check if data has any error, reject if it has.
                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('module-toolkit').ValidationError ;
                        reject(new ValidationError('data does not pass validation', errors));
                    }
                    if (!valid.code)
                        valid.code = CodeGenerator();

                    var item = [];
                    for (var a of valid.classifications) {
                        if (!a.thin || a.thin == '') a.thin = 0;
                        if (!a.thick || a.thick == '') a.thick = 0;
                        if (!a.neps || a.neps == '') a.neps = 0;
                        a.ipi = a.thin + a.thick + a.neps;
                        item.push(a);
                    }
                    valid.classifications = item;

                    valid.product = _product;
                    valid.productId = new ObjectId(valid.product._id);
                    if (!valid.stamp)
                        valid = new Uster(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })

        });
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.master.collection.Uster}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.master.collection.Uster}_code`,
            key: {
                code: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }
}
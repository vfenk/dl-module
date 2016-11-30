'use strict'

var ObjectId = require("mongodb").ObjectId;
require('mongodb-toolkit');
var DLModels = require('dl-models');
var map = DLModels.map;
var LotMachine = DLModels.master.LotMachine;
var ProductManager = require('../master/product-manager');
var MachineManager = require('../master/machine-manager');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');

module.exports = class LotMachineManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.LotMachine);
        this.productManager = new ProductManager(db, user);
        this.machineManager = new MachineManager(db, user);
    }

    _getQuery(paging) {
        var deleted = {
            _deleted: false
        };
        var query = paging.keyword ? {
            '$and': [deleted]
        } : deleted;

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterName = {
                'product.name': {
                    '$regex': regex
                }
            };
            var filterCode = {
                'product.code': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterCode, filterName]
            };

            query['$and'].push($or);
        }
        return query;
    }

    _validate(lotMachine) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = lotMachine;
            // 1. begin: Declare promises.
            var getLotMachinePromise = this.collection.singleOrDefault({
                "$and": [{
                    "$and": [{
                        _id: {
                            '$ne': new ObjectId(valid._id)
                        }
                    }, {
                        productId: new ObjectId(valid.productId)
                    }, {
                        machineId: new ObjectId(valid.machineId)
                    }]
                },
                {
                    _deleted: false
                }]
            });

            var getProduct = valid.productId && ObjectId.isValid(valid.productId) ? this.productManager.getSingleByIdOrDefault(valid.productId) : Promise.resolve(null);
            var getMachine = valid.machineId && ObjectId.isValid(valid.machineId) ? this.machineManager.getSingleByIdOrDefault(valid.machineId) : Promise.resolve(null);
            Promise.all([getLotMachinePromise, getProduct, getMachine])
                .then(results => {
                    var _module = results[0];
                    var _product = results[1];
                    var _machine = results[2];
                    var now = new Date();

                    if (!_product)
                        errors["product"] = i18n.__("LotMachine.product.isRequired:%s is not exists", i18n.__("LotMachine.product._:Product"));
                    else if (!valid.productId)
                        errors["product"] = i18n.__("LotMachine.product.isRequired:%s is required", i18n.__("LotMachine.product._:Product"));
                    else if (valid.product) {
                        if (!valid.product._id)
                            errors["product"] = i18n.__("LotMachine.product.isRequired:%s is required", i18n.__("LotMachine.product._:Product"));
                    }
                    if (!_machine)
                        errors["machine"] = i18n.__("LotMachine.machine.isRequired:%s is not exists", i18n.__("LotMachine.machine._:Machine"));
                    else if (!valid.productId)
                        errors["machine"] = i18n.__("LotMachine.machine.isRequired:%s is required", i18n.__("LotMachine.machine._:Machine"));
                    else if (valid.machine) {
                        if (!valid.machine._id)
                            errors["machine"] = i18n.__("LotMachine.machine.isRequired:%s is required", i18n.__("LotMachine.machine._:Machine"));
                    }

                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('module-toolkit').ValidationError ;
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new LotMachine(lotMachine);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });

    }

    getLotbyMachineProduct(_productId, _machineId) {
        return new Promise((resolve, reject) => {
            var query = {
                "machineId": new ObjectId(_machineId),
                "productId": new ObjectId(_productId)
            };
            query = Object.assign(query, {
                _deleted: false
            });

            this.collection.find(query).toArray()
                .then(Lot => {
                    resolve(Lot);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.master.collection.LotMachine}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.master.collection.LotMachine}_productId_machineId`,
            key: {
                productId: 1,
                machineId: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }
}

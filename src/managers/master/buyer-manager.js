'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");
var DLModels = require('dl-models');
var map = DLModels.map;
var Buyer = DLModels.master.Buyer;
var BaseManager = require('../base-manager');

module.exports = class BuyerManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Buyer);
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
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterName = {
                'name': {
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

    _validate(buyer) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = buyer;
            // 1. begin: Declare promises.
            var getBuyerPromise = this.collection.singleOrDefault({
                "$and": [{
                    "$and": [{
                        _id: {
                            '$ne': new ObjectId(valid._id)
                        }
                    }, {
                            code: valid.code
                        }]
                },
                {
                    _deleted:false
                } ]
            });
            // 2. begin: Validation.
            Promise.all([getBuyerPromise])
                .then(results => {
                    var _module = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "Kode harus diisi";
                    else if (_module) {
                        errors["code"] = "Kode sudah ada";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "Nama Harus diisi";

                    if (Number.isInteger(parseInt(valid.tempo)) === false)
                        errors["tempo"] = "Tempo harus berupa angka";

                    if (!valid.country || valid.country == '')
                        errors["country"] = "Silakan pilih salah satu negara";

                    // 2c. begin: check if data has any error, reject if it has.
                     if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Buyer(buyer);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
}

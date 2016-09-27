'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Currency = DLModels.master.Currency;
var BaseManager = require('../base-manager');

module.exports = class CurrencyManager extends BaseManager {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Currency);
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
                'name': {
                    '$regex': regex
                }
            };

            query['$and'].push(filterName);
        }
        return query;
    }

    _validate(currency) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = currency;
            // 1. begin: Declare promises.
            var getcurrencyPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });

            // 2. begin: Validation.
            Promise.all([getcurrencyPromise])
                .then(results => {
                    var _currency = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "Kode mata uang Tidak Boleh Kosong";
                    else if (_currency) {
                        errors["code"] = "Kode mata uang sudah terdaftar";
                    }

                    if (!valid.symbol || valid.symbol == '')
                        errors["symbol"] = "Simbol mata uang Tidak Boleh Kosong";

                    if (!valid.rate || valid.rate == 0)
                        errors["rate"] = "Rate mata uang Tidak Boleh Kosong";

                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Currency(currency);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

}
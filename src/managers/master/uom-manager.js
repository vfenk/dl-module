'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Uom = DLModels.master.Uom;
var BaseManager = require('../base-manager');

module.exports = class UomManager extends BaseManager {
    
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.uom);
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
            var filterUnit = {
                'unit': {
                    '$regex': regex
                }
            };

            query['$and'].push(filterUnit);
        }
        return query;
    }
    
    _validate(uom) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = uom;
            // 1. begin: Declare promises.
            var getuomPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        unit: valid.unit
                    }]
            });

            // 2. begin: Validation.
            Promise.all([getuomPromise])
                .then(results => {
                    var _uom = results[0];

                    if (!valid.unit || valid.unit == '')
                        errors["unit"] = "Satuan Tidak Boleh Kosong";
                    else if (_uom) {
                        errors["unit"] = "Satuan sudah terdaftar";
                    }

                     if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Uom(uom);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
}
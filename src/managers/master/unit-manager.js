'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Unit = DLModels.master.Unit;
var BaseManager = require('../base-manager');

module.exports = class UnitManager extends BaseManager {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Unit);
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
             var filterDivision = {
                'division': {
                    '$regex': regex
                }
            };
            var filterSubDivision = {
                'subDivision': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterDivision, filterSubDivision]
            };

            query['$and'].push($or);
        }
        return query;
    }
    
    _validate(unit) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = unit;
            // 1. begin: Declare promises.
            var getunitPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        division: valid.division,
                        subDivision: valid.subDivision
                    }]
            });

            // 2. begin: Validation.
            Promise.all([getunitPromise])
                .then(results => {
                    var _unit = results[0];

                    if (!valid.division || valid.division == '')
                        errors["division"] = "Divisi Tidak Boleh Kosong";
                    else if (_unit) {
                        errors["division"] = "Perpaduan Divisi dan Sub Divisi sudah terdaftar";
                    }
                    
                    if (!valid.subDivision || valid.subDivision == '')
                        errors["subDivision"] = "Sub Divisi Tidak Boleh Kosong";
                    else if (_unit) {
                        errors["subDivision"] = "Perpaduan Divisi dan Sub Divisi sudah terdaftar";
                    }

                     if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Unit(unit);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
   
}
'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var YarnEquivalentConversion = DLModels.master.YarnEquivalentConversion;
var BaseManager = require('../base-manager');
var i18n = require('dl-i18n');

module.exports = class YarnEquivalentConversionManager extends BaseManager {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.YarnEquivalentConversion);
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
             var filterNe = {
                'ne': {
                    '$regex': regex
                }
            };
            var filterRatio = {
                'conversionRatio': {
                    '$regex': regex
                }
            };

            var $or = {
                '$or': [filterNe, filterRatio]
            };

            query['$and'].push($or);
        }
        return query;
    }
    
    _validate(yarnEquivalentConversion) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = yarnEquivalentConversion;
            // 1. begin: Declare promises.
            var getYarnEquivalentConversionPromise = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        ne: valid.ne,
                        conversionRatio: valid.conversionRatio
                    }]
            });

            // 2. begin: Validation.
            Promise.all([getYarnEquivalentConversionPromise])
                .then(results => {
                    var _yarnEquivalentConversion = results[0];

                    if (!valid.ne || valid.ne == '')
                        errors["ne"] =  i18n.__("YarnEquivalentConversion.ne.isRequired:%s is required", i18n.__("YarnEquivalentConversion.ne._:Ne"));
                    
                   if (!valid.conversionRatio || valid.conversionRatio == 0)
                        errors["conversionRatio"] = i18n.__("YarnEquivalentConversion.conversionRatio.isRequired:%s is required", i18n.__("YarnEquivalentConversion.conversionRatio._:ConversionRatio"));
                    

                     if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new YarnEquivalentConversion(yarnEquivalentConversion);
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
            name: `ix_${map.master.collection.Vat}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var neRatioIndex = {
            name: `ix_${map.master.collection.Vat}_ne_conversionRatio`,
            key: {
                ne: 1,
                conversionRatio: 1
            },
            unique: true
        } 

        return this.collection.createIndexes([dateIndex, neRatioIndex]);
    }
 
}
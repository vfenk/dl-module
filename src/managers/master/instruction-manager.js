'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Instruction = DLModels.master.Instruction;
var assert = require('assert');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');

module.exports = class InstructionManager extends BaseManager {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Instruction);
    }

    _getQuery(paging) {
        var _default = {
                _deleted: false
            },
            pagingFilter = paging.filter || {},
            keywordFilter = {},
            query = {};

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var materialFilter = {
                "material": {
                    "$regex": regex
                }
            };
            var constructionFilter = {
                "construction": {
                    "$regex": regex
                }
            };
            var processTypeFilter = {
                "processType": {
                    "$regex": regex
                }
            };
            keywordFilter["$or"] = [materialFilter, constructionFilter, processTypeFilter];
        }
        query["$and"] = [_default, keywordFilter, pagingFilter];
        return query;
    }

    _validate(instruction) {
        var errors = {};
        var valid = instruction;
        // 1. begin: Declare promises.
        var getInstructionPromise = this.collection.singleOrDefault({
            _id: {
                '$ne'   : new ObjectId(valid._id)
            },
            material    :valid.material,
            construction:valid.construction,
            processType :valid.processType
        });

        // 2. begin: Validation.
        return Promise.all([getInstructionPromise])
            .then(results => {
                var _instruction = results[0];

                if (_instruction) {
                    errors["material"] = i18n.__("Instruction.material.isExists:%s is exists", i18n.__("Instruction.material._:Material"));
                    errors["construction"] = i18n.__("Instruction.construction.isExists:%s is exists", i18n.__("Instruction.construction._:Construction"));
                    errors["processType"] = i18n.__("Instruction.processType.isExists:%s is exists", i18n.__("Instruction.processType._:ProcessType"));
                }
                else {
                    if (!valid.material || valid.material == "")
                        errors["material"] = i18n.__("Instruction.material.isRequired:%s is required", i18n.__("Instruction.material._:Material")); //"Material Tidak Boleh Kosong";
                    
                    if (!valid.construction || valid.construction == "")
                        errors["construction"] = i18n.__("Instruction.construction.isRequired:%s is required", i18n.__("Instruction.construction._:Construction")); //"construction Tidak Boleh Kosong";
                    
                    if (!valid.processType || valid.processType == "")
                        errors["processType"] = i18n.__("Instruction.processType.isRequired:%s is required", i18n.__("Instruction.processType._:ProcessType")); //"processType Tidak Boleh Kosong";
                    
                    if (!valid.steps || valid.steps.length<=0)
                        errors["steps"] = i18n.__("Instruction.steps.isRequired:%s is required", i18n.__("Instruction.steps._:Steps")); //"steps Tidak Boleh Kosong";
                }
                if (Object.getOwnPropertyNames(errors).length > 0) {
                    var ValidationError = require("module-toolkit").ValidationError;
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                valid = new Instruction(valid);
                valid.stamp(this.user.username, "manager");
                return Promise.resolve(valid);
            });
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.master.collection.Instruction}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        };

        var nameIndex = {
            name: `ix_${map.master.collection.Instruction}_material_construction_processType`,
            key: {
                material: 1,
                construction: 1,
                processType: 1
            },
            unique: true
        };

        return this.collection.createIndexes([dateIndex, nameIndex]);
    }

    getMaterial(key,query){
        return new Promise((resolve, reject) => {
        var regex=new RegExp(key,"i");
        this.collection.aggregate(
                            [{
                                $match: {
                                    $and:[{
                                    $and: [{
                                        "processType": query
                                    }, {
                                        "_deleted": false
                                    }]
                                },{
                                        "material": {
                                            "$regex": regex
                                        }
                                    }]
                                }

                            }, {
                                $group: {
                                    _id: "$material"
                                }
                            }]
                        )
                        .toArray(function(err, result) {
                            assert.equal(err, null);
                            resolve(result);
                        });
    }
        )}
}


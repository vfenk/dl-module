"use strict"

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require("dl-models");
var map = DLModels.map;
var MonitoringEventType = DLModels.master.MonitoringEventType;
var BaseManager = require("module-toolkit").BaseManager;
var i18n = require("dl-i18n");

module.exports = class MonitoringEventTypeManager extends BaseManager {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.MonitoringEventType);
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
            var codeFilter = {
                "code": {
                    "$regex": regex
                }
            };
            var nameFilter = {
                "name": {
                    "$regex": regex
                }
            };
            keywordFilter["$or"] = [codeFilter, nameFilter];
        }
        query["$and"] = [_default, keywordFilter, pagingFilter];
        return query;
    }

    _validate(monitoringEventType) {
        var errors = {};
        var valid = monitoringEventType;
        // 1. begin: Declare promises.
        var getMonitoringEventTypePromise = this.collection.singleOrDefault({
            _id: {
                '$ne': new ObjectId(valid._id)
            },
            code: valid.code
        });

        // 2. begin: Validation.
        return Promise.all([getMonitoringEventTypePromise])
            .then(results => {
                var _monitoringEventType = results[0];

                if (!valid.code || valid.code == "")
                    errors["code"] = i18n.__("MonitoringEventType.code.isRequired:%s is required", i18n.__("MonitoringEventType.code._:Code")); //"Code MonitoringEventType Tidak Boleh Kosong";
                else if (_monitoringEventType) {
                    errors["code"] = i18n.__("MonitoringEventType.code.isExists:%s is already exists", i18n.__("MonitoringEventType.code._:Code")); //"Code MonitoringEventType sudah terdaftar";
                }
                if (!valid.name || valid.name == "")
                    errors["name"] = i18n.__("MonitoringEventType.name.isRequired:%s is required", i18n.__("MonitoringEventType.name._:Name")); //"Nama Harus diisi";

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    var ValidationError = require("module-toolkit").ValidationError;
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                valid = new MonitoringEventType(monitoringEventType);
                valid.stamp(this.user.username, "manager");
                return Promise.resolve(valid);
            });
    }

    getMonitoringEventType() {
        return new Promise((resolve, reject) => {
            var query = {
                _deleted: false
            };

            this.collection
                .where(query)
                .execute()
                .then(monitoringEventTypes => {
                    resolve(monitoringEventTypes);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }



    insert(dataFile) {
        return new Promise((resolve, reject) => {
            var monitoringEventType;
            this.getMonitoringEventType()
                .then(results => {
                    monitoringEventType = results.data;
                    var data = [];
                    if (dataFile != "") {
                        for (var i = 1; i < dataFile.length; i++) {
                            data.push({ "code": dataFile[i][0], "name": dataFile[i][1] });
                        }
                    }
                    var dataError = [], errorMessage;
                    for (var i = 0; i < data.length; i++) {
                        errorMessage = "";
                        if (data[i]["code"] === "" || data[i]["code"] === undefined) {
                            errorMessage = errorMessage + "Kode tidak boleh kosong, ";
                        }
                        if (data[i]["name"] === "" || data[i]["name"] === undefined) {
                            errorMessage = errorMessage + "Nama tidak boleh kosong, ";
                        }
                        for (var j = 0; j < monitoringEventType.length; j++) {
                            if (monitoringEventType[j]["code"] === data[i]["code"]) {
                                errorMessage = errorMessage + "Kode tidak boleh duplikat, ";
                            }
                            if (monitoringEventType[j]["name"] === data[i]["name"]) {
                                errorMessage = errorMessage + "Nama tidak boleh duplikat";
                            }
                        }
                    }
                    if (dataError.length === 0) {
                        var newMonitoringEventType = [];
                        for (var i = 0; i < data.length; i++) {
                            var valid = new MonitoringEventType(data[i]);
                            j += 1;
                            valid.stamp(this.user.username, 'manager');
                            this.collection.insert(valid)
                                .then(id => {
                                    this.getSingleById(id)
                                        .then(resultItem => {
                                            newMonitoringEventType.push(resultItem)
                                            resolve(newMonitoringEventType);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        }
                    } else {
                        resolve(dataError);
                    }
                })
        })
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.master.collection.MonitoringEventType}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.master.collection.MonitoringEventType}_code`,
            key: {
                code: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }

}

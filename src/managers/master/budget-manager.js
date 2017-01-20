'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Budget = DLModels.master.Budget;
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');

module.exports = class BudgetManager extends BaseManager {

    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.master.collection.Budget);
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
                'code': {
                    '$regex': regex
                }
            };
            var nameFilter = {
                'name': {
                    '$regex': regex
                }
            };
            keywordFilter['$or'] = [codeFilter, nameFilter];
        }
        query["$and"] = [_default, keywordFilter, pagingFilter];
        return query;
    }

    _validate(budget) {
        var errors = {};
        var valid = budget;
        // 1. begin: Declare promises.
        var getbudgetPromise = this.collection.singleOrDefault({
            _id: {
                '$ne': new ObjectId(valid._id)
            },
            code: valid.code
        });

        // 2. begin: Validation.
        return Promise.all([getbudgetPromise])
            .then(results => {
                var _budget = results[0];

                if (!valid.code || valid.code == '')
                    errors["code"] = i18n.__("Budget.code.isRequired:%s is required", i18n.__("Budget.code._:Code")); //"Nama Budget Tidak Boleh Kosong";
                else if (_budget) {
                    errors["code"] = i18n.__("Budget.code.isExists:%s is already exists", i18n.__("Budget.code._:Code")); //"Nama Budget sudah terdaftar";
                }

                if (!valid.name || valid.name == '')
                    errors["name"] = i18n.__("Budget.name.isRequired:%s is required", i18n.__("Budget.name._:Name")); //"Nama Harus diisi";

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    var ValidationError = require('module-toolkit').ValidationError;
                    return Promise.reject(new ValidationError('data does not pass validation', errors));
                }

                valid = new Budget(budget);
                valid.stamp(this.user.username, 'manager');
                return Promise.resolve(valid);
            });
    }

    getBudget() {
        return new Promise((resolve, reject) => {
            var query = {
                _deleted: false
            };

            this.collection
                .where(query)
                .execute()
                .then(budgets => {
                    resolve(budgets);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    insert(dataFile) {
        return new Promise((resolve, reject) => {
            // var budget;
            var taskValidation = [];
            this.getBudget()
                .then(results => {
                    var bugetList = results.data;
                    var codeBudgetList = [];
                    var nameBudgetList = [];
                    if (bugetList.length > 0) {
                        codeBudgetList = bugetList.map(function (item) { return item.code });
                        nameBudgetList = bugetList.map(function (item) { return item.name });
                    }
                    var data = [];
                    if (dataFile.length > 1) {
                        for (var i = 1; i < dataFile.length; i++) {
                            data.push({ "code": dataFile[i][0], "name": dataFile[i][1] });
                        }
                    }
                    var dataError = [], errorMessage;
                    for (var budget of data) {
                        errorMessage = [];
                        if (budget.code === "" || budget.code === undefined) {
                            errorMessage.push("Kode tidak boleh kosong");
                        }
                        if (budget.name === "" || budget.name === undefined) {
                            errorMessage.push("Nama tidak boleh kosong");
                        }
                        else {
                            if (codeBudgetList.indexOf(budget.code) !== -1) {
                                errorMessage.push("Kode tidak boleh duplikat");
                            }
                            if (nameBudgetList.indexOf(budget.name) !== -1) {
                                errorMessage.push("Nama tidak boleh duplikat");
                            }
                        }
                        if (errorMessage.length > 0) {
                            dataError.push({ "Kode": budget.code, "Nama": budget.name, "Error": errorMessage.join(", ") });
                        }
                    }
                    if (dataError.length === 0) {
                        var newBudget = [];
                        var taskInsertBudget = [];
                        for (var _budget of data) {
                            taskInsertBudget.push(this._validate(_budget));
                        }
                        Promise.all(taskInsertBudget)
                            .then((validData) => {
                                var taskInsertData = [];
                                for (var valid of validData) {
                                    taskInsertData.push({
                                        insertOne:
                                        {
                                            "document": valid
                                        }
                                    });
                                }
                                this.collection.bulkWrite(taskInsertData)
                                    .then((result) => {
                                        resolve({result : true, data : result})
                                    })
                                    .catch(e => {
                                        reject(e);
                                    });
                            })
                            .catch(e => {
                                reject(e);
                            });
                    }
                    else {
                        resolve({result : false, data : dataError});
                    }
                })
        })
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.master.collection.Budget}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        };

        var codeIndex = {
            name: `ix_${map.master.collection.Budget}_code`,
            key: {
                code: 1
            },
            unique: true
        };

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }

}

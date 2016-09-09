'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Uom = DLModels.core.Uom;

module.exports = class UomManager {

    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.uomCollection = this.db.use(map.core.collection.uom);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                // var filterCategory = {
                //     'category': {
                //         '$regex': regex
                //     }
                // };
                var filterUnit = {
                    'unit': {
                        '$regex': regex
                    }
                };

                query['$and'].push(filterUnit);
            }

            this.uomCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(uoms => {
                    resolve(uoms);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /*readListCategory(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCategory = {
                    'category': {
                        '$regex': regex
                    }
                };

                query['$and'].push(filterCategory);
            }

            this.uomCollection
                .where(query, { users: 0 })
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(uoms => {
                    var listCategory = [];

                    for (var i = 0; i < uoms.length; i++) {
                        var category = {};
                        category._id = uoms[i]._id;
                        category.category = uoms[i].category;
                        category.default = uoms[i].default;
                        listCategory.push(category);
                    }

                    resolve(listCategory);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }*/

    create(uom) {
        return new Promise((resolve, reject) => {
            // uom.default.convertedValue=uom.default.mainValue;
            // uom.default.convertedUnit=uom.default.mainUnit;
            
            this._validate(uom)
                .then(validuom => {

                    this.uomCollection.insert(validuom)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(uom) {
        return new Promise((resolve, reject) => {
            // uom.default.convertedValue=uom.default.mainValue;
            // uom.default.convertedUnit=uom.default.mainUnit;
            this._validate(uom)
                .then(validuom => {
                    this.uomCollection.update(validuom)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    delete(uom) {
        return new Promise((resolve, reject) => {
            this._validate(uom)
                .then(validuom => {
                    validuom._deleted = true;
                    this.uomCollection.update(validuom)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    _validate(uom) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = uom;
            // 1. begin: Declare promises.
            var getuomPromise = this.uomCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        unit: valid.unit
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getuomPromise])
                .then(results => {
                    var _uom = results[0];
                    
                    if (!valid.unit || valid.unit == '')
                        errors["unit"] = "Satuan Tidak Boleh Kosong";
                    else if (_uom) {
                        errors["unit"] = "Satuan sudah terdaftar";
                    }
                    
                    /*if (!valid.category || valid.category == '')
                        errors["category"] = "category is required";
                    else if (_uom) {
                        errors["category"] = "category already exists";
                    }

                    if (!valid.default)
                        errors["default"] = "default is required";
                    else {

                        if (!valid.default.mainUnit || valid.default.mainUnit == '')
                            errors["default"] = "default is required";
                        else {
                            if (valid.default.mainUnit != valid.default.convertedUnit || valid.default.mainValue != valid.default.convertedValue)
                                errors["default"] = "main unit and main value must be equal with converted unit and converted value";
                            else {
                                if (valid.units.length == 0)
                                    errors["units"] = "units is required";
                                else {
                                    var i = 1;
                                    for (var item of valid.units) {
                                        if (item['mainValue'] != valid.default.mainValue || item['mainUnit'] != valid.default.mainUnit) {
                                            errors["units"] = "main unit and main value in units must be equal with main unit and main value in default";
                                            break;
                                        }

                                        if (item['convertedUnit'] == '') {
                                            errors["units"] = "converted unit is required";
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }*/

                    for (var prop in errors) {
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

    getById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(uom => {
                    resolve(uom);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQueryOrDefault(query)
                .then(uom => {
                    resolve(uom);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.uomCollection
                .single(query)
                .then(uom => {
                    resolve(uom);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleByQueryOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.uomCollection
                .singleOrDefault(query)
                .then(uom => {
                    resolve(uom);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
}
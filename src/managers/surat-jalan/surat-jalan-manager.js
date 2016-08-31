'use strict'

var ObjectId = require("mongodb").ObjectId;

require('mongodb-toolkit');

var DLModels = require('dl-models');
var map = DLModels.map;
var SuratJalan = DLModels.suratJalan.SuratJalan;

module.exports = class SuratJalanManager {

    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.SuratJalanCollection = this.db.use('surat-jalan');
    }
    create(suratJalan) {
        return new Promise((resolve, reject) => {
            this._validate(suratJalan)
                .then(validSuratJalan => {
                    this.SuratJalanCollection.insert(validSuratJalan)
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

    update(suratJalan) {
        return new Promise((resolve, reject) => {
            this._validate(suratJalan)
                .then(validSuratJalan => {
                    this.SuratJalanCollection.update(validSuratJalan)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    post(suratJalan) {
        return new Promise((resolve, reject) => {
            this._validate(suratJalan)
                .then(validSuratJalan => {
                    validSuratJalan.isPosted = true;
                    this.SuratJalanCollection.update(validSuratJalan)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    delete(suratJalan) {
        return new Promise((resolve, reject) => {
            this._validate(suratJalan)
                .then(validSuratJalan => {
                    validSuratJalan._deleted = true;
                    this.SuratJalanCollection.update(validSuratJalan)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    _validate(suratJalan) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = suratJalan;

            var getSuratJalanPromise = this.SuratJalanCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        SJNo: valid.SJNo
                    }]
            });
            // 1. end: Declare promises.

            // 2. begin: Validation.
            Promise.all([getSuratJalanPromise])
                .then(results => {
                    var _module = results[0];
                    var now = new Date();
                    if (_module) {
                        if (_module.supplier.name == valid.supplier.name)
                            errors["SJNo"] = "Nomor surat jalan sudah terdaftar";
                    }
                    else if (!valid.SJNo || valid.SJNo == '')
                        errors["SJNo"] = "Nomor surat jalan tidak boleh kosong";

                    if (!valid.SJDate || valid.SJDate == '')
                        errors["SJDate"] = "Tanggal surat jalan tidak boleh kosong";
                    else if (valid.SJDate > now)
                        errors["SJDate"] = "Tanggal surat jalan tidak boleh lebih besar dari tanggal hari ini";

                    if (!valid.productArriveDate || valid.productArriveDate == '')
                        errors["productArriveDate"] = "Tanggal datang barang tidak boleh kosong";
                    else if (valid.productArriveDate > now)
                        errors["productArriveDate"] = "Tanggal datang barang tidak boleh lebih besar dari tanggal hari ini";
                    else if (valid.productArriveDate < valid.SJDate)
                        errors["productArriveDate"] = "Tanggal datang barang tidak boleh lebih kecil dari tanggal surat jalan";

                    if (!valid.supplier)
                        errors["supplier"] = "Supplier tidak boleh kosong";
                    else if (!valid.supplier.name || valid.supplier.name == '')
                        errors["supplier"] = "Supplier tidak boleh kosong";

                    if (!valid.deliveryType || valid.deliveryType == '')
                        errors["deliveryType"] = "Jenis Pengiriman tidak boleh kosong";

                    if (valid.deliveryType != 'Lokal')
                        if (!valid.deliveryNo || valid.deliveryNo == '')
                            errors["deliveryNo"] = "Nomor Penggiriman tidak boleh kosong";
                    
                    if (!valid.items) {
                        errors["items"] = "Harus ada minimal 1 nomor PO"
                    }
                    else if (valid.items.length == 0) {
                        errors["items"] = "Harus ada minimal 1 nomor PO"
                    }
                    // 2c. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('../../validation-error');
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    if (!valid.stamp)
                        valid = new SuratJalan(valid);

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
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
                var filterSJNo = {
                    'SJNo': {
                        '$regex': regex
                    }
                };
                var filterRefSJNo = {
                    'RefSJNo': {
                        '$regex': regex
                    }
                };
                var filterSupplier = {
                    'supplier.name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterSJNo, filterRefSJNo, filterSupplier]
                };

                query['$and'].push($or);
            }

            this.SuratJalanCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(suratJalans => {
                    resolve(suratJalans);
                })
                .catch(e => {
                    reject(e);
                });
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
                .then(suratJalan => {
                    resolve(suratJalan);
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
                .then(suratJalan => {
                    resolve(suratJalan);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.SuratJalanCollection
                .single(query)
                .then(suratJalan => {
                    resolve(suratJalan);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    getSingleByQueryOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.SuratJalanCollection
                .singleOrDefault(query)
                .then(suratJalan => {
                    resolve(suratJalan);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
}
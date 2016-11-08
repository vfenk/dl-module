'use strict'
var helper = require('../../helper');
var UnitPaymentOrderManager = require('../../../src/managers/purchasing/unit-payment-order-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var supplier = require('../master/supplier-data-util');
var unit = require('../master/unit-data-util');
var currency = require('../master/currency-data-util');
var category = require('../master/category-data-util');
var vat = require('../master/vat-data-util');
var unitReceiptNote = require('./unit-receipt-note-data-util');

class UnitPaymentOrderDataUtil {
    getNew() {
        return new Promise((resolve, reject) => {
            helper
                .getManager(UnitPaymentOrderManager)
                .then(manager => {
                    Promise.all([unit.getTestData(), category.getTestData(), currency.getTestData(), vat.getTestData(), supplier.getTestData(), unitReceiptNote.getNew()])
                        .then(results => {
                            var data = {
                                no: `UT/UPO/${codeGenerator()}`,
                                unitId: results[0]._id,
                                unit: results[0],
                                date: new Date(),
                                categoryId: results[1]._id,
                                category: results[1],
                                currency: results[2],
                                vat: results[3],
                                paymentMethod: 'CASH',
                                supplierId: results[4]._id,
                                supplier: results[4],
                                invoceNo: `UT/INVOICE/${codeGenerator()}`,
                                invoceDate: new Date(),
                                incomeTaxNo: `UT/PPN/${codeGenerator()}`,
                                incomeTaxDate: new Date(),
                                useVat: true,
                                useIncomeTax: true,
                                vatNo: `UT/PPH/${codeGenerator()}`,
                                vatDate: new Date(),
                                dueDate: new Date(),
                                vatRate: 2,
                                remark: 'Unit Test Unit Payment Order',
                                items: [{
                                    unitReceiptNoteId: results[5]._id,
                                    unitReceiptNote: results[5]
                                }]
                            };
                            manager.create(data)
                                .then(id => {
                                    manager.getSingleById(id)
                                        .then(data => {
                                            resolve(data);
                                        })
                                        .catch(e => {
                                            reject(e);
                                        });
                                })
                                .catch(e => {
                                    reject(e);
                                });
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
}

module.exports = new UnitPaymentOrderDataUtil(); 
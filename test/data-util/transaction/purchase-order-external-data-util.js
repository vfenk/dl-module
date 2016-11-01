'use strict'
var helper = require('../../helper');
var PoExternalManager = require('../../../src/managers/purchasing/purchase-order-external-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var supplier = require('../master/supplier-data-util');
var currency = require('../master/currency-data-util');
var vat = require('../master/vat-data-util');
var po = require('./purchase-order-data-util');

class PurchaseOrderExternalDataUtil {
    getNew() {
        return new Promise((resolve, reject) => {
            helper
                .getManager(PoExternalManager)
                .then(manager => {
                    Promise.all([supplier.getTestData(), currency.getTestData(), vat.getTestData(), po.getNew()])
                        .then(results => {
                            var data = {
                                no: `UT/PO External/${codeGenerator()}`,
                                refNo: '',
                                supplierId: results[0]._id,
                                supplier: results[0],
                                freightCostBy: '',
                                unit: results[0],
                                currency: results[1],
                                currencyRate: results[1].rate,
                                paymentMethod: 'CASH',
                                paymentDueDays: 0,
                                vat : results[2],
                                useVat : false,
                                vatRate : results[2].rate,
                                useIncomeTax : false, 
                                date : new Date(),
                                expectedDeliveryDate : new Date(),
                                actualDeliveryDate : new Date(),
                                isPosted : false,
                                isClosed : false,
                                remark : '', 
                                items: [results[3]]
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

module.exports = new PurchaseOrderExternalDataUtil();

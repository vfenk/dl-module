'use strict'
var helper = require('../../helper');
var PoExternalManager = require('../../../src/managers/purchasing/purchase-order-external-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var supplier = require('../master/supplier-data-util');
var currency = require('../master/currency-data-util');
var vat = require('../master/vat-data-util');
var po = require('./purchase-order-data-util');

var get2NewPos = function() {
    return po.getNew()
        .then((po1) => {
            return po.getNew()
                .then((po2) => {
                    return Promise.resolve([po1, po2]);
                });
        });
};

class PurchaseOrderExternalDataUtil {
    getNew(purchaseOrders) {
        return new Promise((resolve, reject) => {
            helper
                .getManager(PoExternalManager)
                .then(manager => { 
                    var getPurchaseOrders = purchaseOrders ? purchaseOrders : get2NewPos(); 
                    Promise.all([supplier.getTestData(), currency.getTestData(), vat.getTestData(), getPurchaseOrders])
                        .then(results => {
                            var supplier = results[0];
                            var currency = results[1];
                            var vat = results[2];
                            var pos = results[3];

                            for (var po of pos) {
                                for (var poItem of po.items) {
                                    poItem.currency = currency;
                                    poItem.currencyRate = currency.rate;
                                    poItem.dealQuantity = poItem.defaultQuantity;
                                    poItem.dealUom = poItem.defaultUom;
                                    poItem.pricePerDealUnit = poItem.product.price * 1.05;
                                    poItem.priceBeforeTax= poItem.pricePerDealUnit;
                                }
                            }

                            var data = {
                                no: `UT/PO External/${codeGenerator()}`,
                                refNo: '',
                                supplierId: supplier._id,
                                supplier: supplier,
                                freightCostBy: 'Penjual',
                                currency: currency,
                                currencyRate: currency.rate,
                                paymentMethod: 'CASH',
                                paymentDueDays: 0,
                                vat: vat,
                                useVat: vat != undefined,
                                vatRate: vat.rate,
                                useIncomeTax: false,
                                date: new Date(),
                                expectedDeliveryDate: new Date(),
                                actualDeliveryDate: new Date(),
                                isPosted: false,
                                isClosed: false,
                                remark: '',
                                items: pos
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

    getPosted() {
        return new Promise((resolve, reject) => {
            this.getNew()
                .then(poe => {
                    helper
                        .getManager(PoExternalManager)
                        .then(manager => {
                            manager.post([poe])
                                .then(ids => {
                                    var id = ids[0];
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
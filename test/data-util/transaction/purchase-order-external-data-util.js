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
                            var poItems = results[3].items.map(poItem => {
                                return {
                                    product: poItem.product,
                                    defaultQuantity: poItem.defaultQuantity,
                                    defaultUom: poItem.defaultUom,
                                    dealQuantity: 90,
                                    dealUom: poItem.dealUom,
                                    realizationQuantity: poItem.realizationOrder,
                                    pricePerDealUnit: 500,
                                    currency: poItem.currency,
                                    currencyRate: poItem.currencyRate,
                                    conversion: 5,
                                    isClosed: false,
                                    remark: '',
                                    fulfillments: []
                                };
                            });

                            poItems = [].concat.apply([], poItems);

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
                                vat: results[2],
                                useVat: false,
                                vatRate: results[2].rate,
                                useIncomeTax: false,
                                date: new Date(),
                                expectedDeliveryDate: new Date(),
                                actualDeliveryDate: new Date(),
                                isPosted: false,
                                isClosed: false,
                                remark: '',
                                items: [{
                                    _id: results[3]._id,
                                    no: results[3].no,
                                    refNo: results[3].refNo,
                                    iso: results[3].iso,
                                    realizationOrderId: results[3].realizationOrderId,
                                    realizationOrder: results[3].realizationOrder,
                                    purchaseRequestId: results[3].purchaseRequestId,
                                    purchaseRequest: results[3].purchaseRequest,
                                    buyerId: results[3].buyerId,
                                    buyer: results[3].buyer,
                                    purchaseOrderExternalId: results[3].purchaseOrderExternalId,
                                    purchaseOrderExternal: results[3].purchaseOrderExternal,
                                    sourcePurchaseOrderId: results[3].sourcePurchaseOrderId,
                                    sourcePurchaseOrder: results[3].sourcePurchaseOrder,
                                    supplierId: results[3].supplierId,
                                    supplier: results[3].supplier,
                                    unitId: results[3].unitId,
                                    unit: results[1],
                                    categoryId: results[2]._id,
                                    category: results[2], 
                                    vat: results[3].vat,
                                    useVat: false,
                                    vatRate: 0,
                                    useIncomeTax: false,
                                    date: new Date(),
                                    expectedDeliveryDate: new Date(),
                                    actualDeliveryDate: new Date(),
                                    isPosted: true,
                                    isClosed: false,
                                    remark: 'Unit Test PO Internal',
                                    items: poItems 
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

module.exports = new PurchaseOrderExternalDataUtil();

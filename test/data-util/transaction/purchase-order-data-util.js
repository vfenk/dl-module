'use strict'
var helper = require('../../helper');
var PurchaseOrderManager = require('../../../src/managers/purchasing/purchase-order-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var unit = require('../master/unit-data-util');
var vat = require('../master/vat-data-util');
var category = require('../master/category-data-util');
var purchaseRequest = require('../transaction/purchase-request-data-util');
var product = require('../master/product-data-util');  
var DLModels = require('dl-models');
var Currency = DLModels.master.Currency;
var Buyer=DLModels.master.Buyer;
var Supplier=DLModels.master.Supplier;

class PurchaseOrderDataUtil {
    getNew() {
        return new Promise((resolve, reject) => {
            helper
                .getManager(PurchaseOrderManager)
                .then(manager => {
                    Promise.all([purchaseRequest.getNew(), unit.getTestData(), category.getTestData(), vat.getTestData(), product.getTestData()])
                        .then(results => {
                            var data = {
                                no: `UT/PO/${codeGenerator()}`,
                                refNo: results[0].no,
                                iso: 'FM-6.00-06-005',
                                realizationOrderId: {},
                                realizationOrder: {},
                                purchaseRequestId: results[0]._id,
                                purchaseRequest: results[0],
                                buyerId: {},
                                buyer:new Buyer(),
                                purchaseOrderExternalId: {},
                                purchaseOrderExternal: {},
                                sourcePurchaseOrderId: null,
                                sourcePurchaseOrder: null,
                                supplierId: {},
                                supplier: new Supplier() ,
                                unitId: results[1]._id,
                                unit: results[1],
                                categoryId: results[2]._id,
                                category: results[2],

                                vat : results[3],
                                useVat : false,
                                vatRate : 0,
                                useIncomeTax : false, 
                                date : new Date(),
                                expectedDeliveryDate : new Date(),
                                actualDeliveryDate : new Date(), 
                                isPosted : false,
                                isClosed : false,
                                remark : 'Unit Test PO Internal',
 
                                items: [{
                                    product: results[4],
                                    defaultQuantity: 100,
                                    defaultUom: results[4].uom,
                                    dealQuantity:0,
                                    dealUom:results[4].uom,
                                    realizationQuantity:0,
                                    pricePerDealUnit:500,
                                    currency:new Currency(),
                                    currencyRate:1,
                                    conversion:1,
                                    isClosed: false,
                                    remark: '',
                                    fulfillments:[]
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

module.exports = new PurchaseOrderDataUtil();

'use strict'
var helper = require('../../helper');
var PurchaseRequestManager = require('../../../src/managers/purchasing/purchase-request-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var unit = require('../master/unit-data-util');
var category = require('../master/category-data-util');
var product = require('../master/product-data-util');

class PurchaseRequestDataUtil {
    getNew() {
        return new Promise((resolve, reject) => {
            helper
                .getManager(PurchaseRequestManager)
                .then(manager => {
                    Promise.all([unit.getTestData(), category.getTestData(), product.getTestData()])
                        .then(results => {
                            var data = {
                                no: `UT/PR/${codeGenerator()}`,
                                date: new Date(),
                                expectedDeliveryDate: new Date(),
                                budget: {
                                    code: 'UT/BUDGET/01',
                                    name: 'BUDGET-01'
                                },
                                unitId: results[0]._id,
                                unit: results[0],
                                categoryId: results[1]._id,
                                category: results[1],

                                isPosted: false,
                                remark: 'Unit Test',
                                items: [{
                                    product: results[2],
                                    quantity: 10,
                                    uom: results[2].uom,
                                    remark: ''
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

module.exports = new PurchaseRequestDataUtil();

'use strict'
var helper = require('../../helper');
var PurchaseRequestManager = require('../../../src/managers/purchasing/purchase-request-manager');
var codeGenerator = require('../../../src/utils/code-generator');
var unit = require('../master/unit-data-util');
var category = require('../master/category-data-util');
var product = require('../master/product-data-util');
var budget = require('../master/budget-data-util');

class PurchaseRequestDataUtil {
    getNew() {
        return new Promise((resolve, reject) => {
            helper
                .getManager(PurchaseRequestManager)
                .then(manager => {
                    Promise.all([unit.getTestData(), category.getTestData(), product.getTestData(),budget.getTestData()])
                        .then(results => {
                            var unit = results[0];
                            var category = results[1];
                            var product = results[2];
                            var budget = results[3];
                            
                            var data = {
                                no: `UT/PR/${codeGenerator()}`,
                                date: new Date(),
                                expectedDeliveryDate: new Date(),
                                budget: budget,
                                unitId: unit._id,
                                unit: unit,
                                categoryId: category._id,
                                category: category,

                                isPosted: false,
                                remark: 'Unit Test',
                                items: [{
                                    product: product,
                                    quantity: 10,
                                    uom: product.uom,
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

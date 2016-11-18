'use strict';
var _getSert = require('./getsert');
var classification = require('dl-models').master.UsterClassification;
var Product = require('./product-data-util'); 

class UsterDataUtil {
    getSert(uster) {
        var UsterManager = require('../../../src/managers/master/uster-manager');
        return Promise.resolve(_getSert(uster, UsterManager, data => {
            return {
                code: data.code
            };
        }));
    }
    getTestData() {
        return new Promise((resolve, reject) => {
            Product.getTestData()
                    .then(product => {
                        var Excellent  = new classification();
                        Excellent.thin = 5;
                        Excellent.thick = 10;
                        Excellent.neps = 15;
                        Excellent.grade = "Excellent";
                        var Good  = new classification();
                        Good.thin = 10;
                        Good.thick = 20;
                        Good.neps = 30;
                        Good.grade = "Good";
                        var Medium  = new classification();
                        Medium.thin = 15;
                        Medium.thick = 30;
                        Medium.neps = 45;
                        Medium.grade = "Medium";
                        var Low  = new classification();
                        Low.thin = 20;
                        Low.thick = 40;
                        Low.neps = 60;
                        Low.grade = "Low";
                        var Bad  = new classification();
                        Bad.thin = 25;
                        Bad.thick = 50;
                        Bad.neps = 75;
                        Bad.grade = "Bad";
                        var testData = {
                            code: 'PC 30',
                            productId: product._id,
                            product: product,
                            classifications: []
                        };
                        testData.classifications.push(Excellent);
                        testData.classifications.push(Good);
                        testData.classifications.push(Medium);
                        testData.classifications.push(Low);
                        testData.classifications.push(Bad);

                    this.getSert(testData)
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
        });
    }
}
module.exports = new UsterDataUtil();
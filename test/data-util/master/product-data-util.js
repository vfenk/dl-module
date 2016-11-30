"use strict";
var _getSert = require("./getsert");
var uom = require("./uom-data-util");

class ProductDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/product-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        });
    }

    getNewData() {
        return uom.getTestData()
            .then((uom) => {
                var now = new Date();
                var stamp = now / 1000 | 0;
                var code = stamp.toString(36);

                var data = {
                    code: code,
                    name: `name[${code}]`,
                    price: 1250,
                    uomId: uom._id,
                    uom: uom,
                    description: `description for ${code}`,
                    tags: `tags for ${code}`,
                    properties: []
                };
                return Promise.resolve(data);
            });
    }

    getRandomTestData() {
        return this.getNewData()
            .then((data) => {
                return this.getSert(data);
            });
    }

    getTestData() {
        return uom.getTestData()
            .then((uom) => {
                var data = {
                    code: "P01-UT",
                    name: "Product 01",
                    price: 1250,
                    uomId: uom._id,
                    uom: uom,
                    description: "Product untuk unit test",
                    tags: "#unit-test, #product",
                    properties: []
                };
                return this.getSert(data);
            });
    }

    getTestData2() {
        return uom.getTestData()
            .then((uom) => {
                var data = {
                    code: "P02-UT",
                    name: "Product 02",
                    price: 8500,
                    description: "Product untuk unit test",
                    uomId: uom._id,
                    uom: uom,
                    tags: "#unit-test, #product",
                    properties: []
                };
                return this.getSert(data);
            });
    }
}
module.exports = new ProductDataUtil();

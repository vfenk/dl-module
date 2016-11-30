"use strict";
var _getSert = require("./getsert");

class CurrencyDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/currency-manager");
        return Promise.resolve(_getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        }));
    }

    getNewData() {
        var Model = require("dl-models").master.Currency;
        var data = new Model();

        var now = new Date();
        var stamp = now / 1000 | 0;
        var code = stamp.toString(36);

        data.code = code;
        data.symbol = `symbol[${code}]`;
        data.rate = 1;

        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            code: "UTT",
            symbol: "Ut",
            rate: 1,
            description: "Unit test currency"
        };
        return Promise.resolve(this.getSert(data));
    }
}

module.exports = new CurrencyDataUtil();

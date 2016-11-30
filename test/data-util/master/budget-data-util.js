"use strict";
var _getSert = require("./getsert");

class BudgetDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/budget-manager");
        return Promise.resolve(_getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        }));
    }

    getNewData() {
        var Model = require('dl-models').master.Budget;
        var data = new Model();

        var now = new Date();
        var stamp = now / 1000 | 0;
        var code = stamp.toString(36);

        data.code = code;
        data.name = `name[${code}]`;

        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            code: "UT/BUDGET/01",
            name: "data 01"
        };
        return Promise.resolve(this.getSert(data));
    }
}
module.exports = new BudgetDataUtil();

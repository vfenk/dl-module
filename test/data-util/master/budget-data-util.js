"use strict";
var _getSert = require("./getsert");

class BudgetDataUtil {
    getSert(budget) {
        var BudgetManager = require("../../../src/managers/master/budget-manager");
        return Promise.resolve(_getSert(budget, BudgetManager, (data) => {
            return {
                code: data.code
            };
        }));
    }

    getNewData() {
        var Budget = require('dl-models').master.Budget;
        var budget = new Budget();

        var now = new Date();
        var stamp = now / 1000 | 0;
        var code = stamp.toString(36);

        budget.code = code;
        budget.name = `name[${code}]`;

        return Promise.resolve(budget);
    }

    getTestData() {
        var testData = {
            code: "UT/Budget/01",
            name: "budget 01"
        };
        return Promise.resolve(this.getSert(testData));
    }
}
module.exports = new BudgetDataUtil();

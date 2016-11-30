"use strict";
var _getSert = require("./getsert");

class CategoryDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/category-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        });
    }

    getNewData() {
        var Model = require("dl-models").master.Category;
        var data = new Model();

        var now = new Date();
        var stamp = now / 1000 | 0;
        var code = stamp.toString(36);

        data.code = code;
        data.name = `name[${code}]`;
        data.codeRequirement = `codeRequirement[${code}]`;

        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            code: "UT/CATEGORY/01",
            name: "Category 01",
            codeRequirement: ""
        };
        return this.getSert(data);
    }
}
module.exports = new CategoryDataUtil();

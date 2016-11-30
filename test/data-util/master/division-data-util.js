"use strict";
var _getSert = require("./getsert");

class DivisionDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/division-manager");
        return Promise.resolve(_getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        }));
    }

    getNewData() {
        var Model = require('dl-models').master.Division;
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
            code: 'UT/DIV/01',
            name: 'Div Unit Test',
            description: ''
        };
        return Promise.resolve(this.getSert(data));
    }
}
module.exports = new DivisionDataUtil();

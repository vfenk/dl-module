"use strict";
var _getSert = require("../getsert");
var unit = require("./unit-data-util");
var generateCode = require("../../../src/utils/code-generator");

class MachineDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/machine-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        });
    }

    getNewData() {
        return unit.getTestData()
            .then(unit => {

                var now = new Date();
                var code = generateCode();

                var data = {
                    name: `name [${code}]`,
                    unitId: unit._id,
                    unit: unit,
                    process: `process [${code}]`,
                    manufacture: `manufacture [${code}]`,
                    year: now.getFullYear(),
                    condition: `condition [${code}]`
                };
                return Promise.resolve(data);
            });
    }

    getTestData() {
        return unit.getTestData()
            .then(unit => {
                var data = {
                    code: "UT/UNIT/01",
                    unitId: unit._id,
                    unit: unit,
                    name: "Test Machine",
                    description: ""
                };
                return this.getSert(data);
            });
    }
}
module.exports = new MachineDataUtil();

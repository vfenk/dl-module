'use strict';
var _getSert = require('./getsert');

class UnitDataUtil {
    getSert(unit) {
        var UnitManager = require('../../../src/managers/master/unit-manager');
        return Promise.resolve(_getSert(unit, UnitManager, data => {
            return {
                code: data.code
            };
        }));
    }
    getTestData() {
        var testData = {
            code: 'UT/UNIT/01',
            division: 'Div Unit Test',
            subDivision: 'Sub Div Unit Test',
            description: ''
        };
        return Promise.resolve(this.getSert(testData));
    }
}
module.exports = new UnitDataUtil();
"use strict";
var _getSert = require("../getsert");
var generateCode = require("../../../src/utils/code-generator");

class MonitoringEventTypeDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/monitoring-event-type-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        });
    }

    getNewData() {
        var Model = require('dl-models').master.MonitoringEventType;
        var data = new Model();

        var code = generateCode();

        data.code = code;
        data.name = `name[${code}]`;

        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            code: '1',
            name: 'Monitoring Event Type Unit Test',
        };
        return this.getSert(data);
    }

    getTestData2() {
        var data = {
            code: '2',
            name: 'EX - Monitoring Event Type Unit Test',
        };
        return this.getSert(data);
    }

}
module.exports = new MonitoringEventTypeDataUtil();

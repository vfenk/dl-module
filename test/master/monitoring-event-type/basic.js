var options = {
    manager: require("../../../src/managers/master/monitoring-event-type-manager"),
    model: require("dl-models").master.MonitoringEventType,
    util: require("../../data-util/master/monitoring-event-type-data-util"),
    validator: require("dl-models").validator.master.monitoringEventType,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);

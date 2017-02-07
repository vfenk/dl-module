var options = {
    manager: require("../../../src/managers/sales/production-order-manager"),
    model: require("dl-models").sales.salesContract,
    util: require("../../data-util/sales/production-order-data-util"),
    validator: require("dl-models").validator.sales.salesContract,
    createDuplicate: false,
    keys: []
};

var basicTest = require("../../basic-test-factory");
basicTest(options); 
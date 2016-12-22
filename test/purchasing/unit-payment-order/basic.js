var options = {
    manager: require("../../../src/managers/purchasing/unit-payment-order-manager"),
    model: require("dl-models").purchasing.UnitPaymentOrder,
    util: require("../../data-util/purchasing/unit-payment-order-data-util"),
    validator: require("dl-models").validator.purchasing.unitPaymentOrder,
    createDuplicate: false,
    keys: ["no"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);

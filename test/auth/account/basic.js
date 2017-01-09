var options = {
    manager: require("../../../src/managers/auth/account-manager"),
    model: require("dl-models").auth.Account,
    util: require("../../data-util/auth/account-data-util"),
    validator: require("dl-models").validator.auth.account,
    createDuplicate: true,
    keys: ["username"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);

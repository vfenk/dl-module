var options = {
    manager: require("../../../src/managers/auth/role-manager"),
    model: require("dl-models").auth.Role,
    util: require("../../data-util/auth/role-data-util"),
    validator: require("dl-models").validator.auth.role,
    createDuplicate: true,
    keys: ["code"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);

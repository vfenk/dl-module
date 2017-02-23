var options = {
    manager: require("../../../src/managers/auth/api-endpoint-manager"),
    model: require("dl-models").auth.ApiEndpoint,
    util: require("../../data-util/auth/api-endpoint-data-util"),
    validator: require("dl-models").validator.auth.apiEndpoint,
    createDuplicate: true,
    keys: ["name"]
};

var basicTest = require("../../basic-test-factory");
basicTest(options);

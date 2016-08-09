var validate = require('./validator').core;

it("#01. Fabric should valid", function () {
    var Fabric = require('../src/core/fabric');
    validate.fabric(new Fabric());
})

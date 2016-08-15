var validate = require('../src/validator').core;

it("#02. Fabric should valid", function () {
    var Fabric = require('../src/core/fabric');
    
    validate.fabric(new Fabric());
})

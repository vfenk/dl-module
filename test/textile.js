var validate = require('../src/validator').core;

it("#03. Textile should valid", function () {
    var Textile = require('../src/core/textile');
    
    validate.textile(new Textile());
})

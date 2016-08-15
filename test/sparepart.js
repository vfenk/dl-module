var validate = require('../src/validator').core;

it("#04. Sparepart should valid", function () {
    var Sparepart = require('../src/core/sparepart');
    
    validate.sparepart(new Sparepart());
}) 

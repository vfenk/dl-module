var validate = require('../src/validator').core;

it("#02. Suppliers should valid", function(){
    
    var Supplier = require('../src/core/supplier');

    validate.supplier(new Supplier());
})
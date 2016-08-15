var validate = require('../src/validator').core;

it("#01. Suppliers should valid", function(){
    
    var Supplier = require('../src/core/supplier');

    validate.supplier(new Supplier());
})
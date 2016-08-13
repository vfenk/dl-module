var validate = require('./validator').core;

it("#01. Suppliers should valid", function(){
    var Supplier = require('../src/core/suppliers');

    var suppliers = new Suppliers();
    
    validate.suppliers(suppliers);
})
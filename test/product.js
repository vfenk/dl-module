var validate = require('../src/validator').core;

it("#03. Product should valid", function () {
    var Product = require('../src/core/product');
    
    validate.product(new Product());
})

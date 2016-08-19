var validate = require('../src/validator').core;

it("#01. Buyer should valid", function(){
    var Buyer = require('../src/core/buyer');
    
    validate.buyer(new Buyer());
})
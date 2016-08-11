var validate = require('./validator').core;

it("#01. Buyers should valid", function(){
    var Buyers = require('../src/core/buyers');

    var buyers = new Buyers();
    
    validate.buyers(buyers);
})
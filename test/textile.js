var validate = require('./validator').core;

it("#01. Textile should valid", function(){
    var Textile = require('../src/core/textile');
    validate.textile(new Textile());
}) 
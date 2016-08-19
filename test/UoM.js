var validate = require('../src/validator').core;

it("#04. UoM should valid", function () {
    var UoM = require('../src/core/UoM').UoM;
    
    validate.UoM(new UoM());
})
 
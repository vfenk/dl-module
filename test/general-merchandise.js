var validate = require('../src/validator').core;

it("#03. General Merchandise should valid", function(){
    var GeneralMerchandise = require('../src/core/general-merchandise');
    
    validate.generalMerchandise(new GeneralMerchandise());
}) 
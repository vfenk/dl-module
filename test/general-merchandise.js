var validate = require('./validator').core;

it("#03. General Merchandise should valid", function(){
    var GeneralMerchandise = require('../src/core/general-merchandise');
    var UoM_Template = require('../src/core/UoM').UoM_Template;
    var UoM = require('../src/core/UoM').UoM;

    var generalMerchandise = new GeneralMerchandise();
    var template = new UoM_Template({
        mainUnit: 'M',
        mainValue: 1,
        convertedUnit: 'M',
        convertedValue: 1 
    });

    var _units = [];
    _units.push(template);
    var uom = new UoM({
        category: 'UoM-Unit-Test',
        default: template,
        units: _units
    });

    generalMerchandise.UoM = uom;
    validate.generalMerchandise(generalMerchandise);
}) 
var validate = require('./validator').core;

it("#01. Buyers should valid", function(){
    var Buyers = require('../src/core/buyers');
    var UoM_Template = require('../src/core/UoM-docs').UoM_Template;
    var UoM = require('../src/core/UoM-docs').UoM;

    var buyers = new Buyers();
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

    buyers.UoM = uom;
    validate.buyers(buyers);
})
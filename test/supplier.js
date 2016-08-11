var validate = require('./validator').core;

it("#01. Suppliers should valid", function(){
    var Suppliers = require('../src/core/suppliers');
    var UoM_Template = require('../src/core/UoM-docs').UoM_Template;
    var UoM = require('../src/core/UoM-docs').UoM;

    var suppliers = new Suppliers();
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

    suppliers.UoM = uom;
    validate.suppliers(suppliers);
})
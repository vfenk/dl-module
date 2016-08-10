var validate = require('./validator').core;

it("#02. Fabric should valid", function () {
    var Fabric = require('../src/core/fabric');
    var UoM_Template = require('../src/core/UoM-docs').UoM_Template;
    var UoM = require('../src/core/UoM-docs').UoM;

    var fabric = new Fabric();
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

    fabric.UoM = uom;
    validate.fabric(fabric);
})

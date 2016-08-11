var validate = require('./validator').core;

it("#01. Accessories should valid", function () {
    var Accessories = require('../src/core/accessories');
    var UoM_Template = require('../src/core/UoM').UoM_Template;
    var UoM = require('../src/core/UoM').UoM;

    var accessories = new Accessories();
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

    accessories.UoM = uom;
    validate.accessories(accessories);
})

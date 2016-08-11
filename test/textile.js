var validate = require('./validator').core;

it("#03. Textile should valid", function () {
    var Textile = require('../src/core/textile');
    var UoM_Template = require('../src/core/UoM').UoM_Template;
    var UoM = require('../src/core/UoM').UoM;

    var textile = new Textile();
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

    textile.UoM = uom;
    validate.textile(textile);
})

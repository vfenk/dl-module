var validate = require('./validator').core;

it("#04. Sparepart should valid", function(){
    var Sparepart = require('../src/core/sparepart');
    var UoM_Template = require('../src/core/UoM-docs').UoM_Template;
    var UoM = require('../src/core/UoM-docs').UoM;

    var sparepart = new Sparepart();
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

    sparepart.UoM = uom;
    validate.sparepart(sparepart);
}) 
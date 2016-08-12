var validate = require('./validator').po;
it("#06. PO Garment SparePart should valid", function () {
    var POGarmentSparepart = require('../src/po/PO-garment-sparepart');
    var Supplier = require('../src/core/supplier');
    var UoM_Template = require('../src/core/UoM').UoM_Template;
    var UoM = require('../src/core/UoM').UoM;
    var SparepartValue = require('../src/po/sparepart-value');
    var Sparepart = require('../src/core/sparepart');

    var pOGarmentSparepart = new POGarmentSparepart();
    pOGarmentSparepart.RONo = '12333';
    pOGarmentSparepart.PRNo = '12333';
    pOGarmentSparepart.PONo = '126666';
    pOGarmentSparepart.ppn = 10;
    pOGarmentSparepart.deliveryDate = new Date();
    pOGarmentSparepart.termOfPayment = 'Tempo 2 bulan';
    pOGarmentSparepart.deliveryFeeByBuyer = true;
    pOGarmentSparepart.PODLNo = '';
    pOGarmentSparepart.description = 'SP1';

    var supplier = new Supplier({
        code: '123',
        name: 'hot',
        description: 'hotline',
        phone: '0812....',
        address: 'test',
        local: true
    });

    var template = new UoM_Template({
        mainUnit: 'M',
        mainValue: 1,
        convertedUnit: 'M',
        convertedValue: 1
    });

    var _units = [];
    _units.push(template);
    
    var _uom = new UoM({
        category: 'UoM-Unit-Test',
        default: template,
        units: _units
    });

    var sparepart = new Sparepart({
        code: '22',
        name: 'hotline',
        description: 'hotline123',
        UoM: _uom
    });

    var sparepartValue = new SparepartValue({
        qty: 0,
        unit: '',
        price: 0,
        sparepart: sparepart
    });
    var _spareparts = [];
    _spareparts.push(sparepartValue);

    pOGarmentSparepart.supplier = supplier;
    pOGarmentSparepart.items = _spareparts;
    validate.POGarmentSparePart(pOGarmentSparepart);

})

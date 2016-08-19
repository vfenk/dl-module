var validate = require('./validator').po;

it("#06. PO Garment Accessories should valid", function () {
    var POGarmentAccessories = require('../src/po/PO-garment-accessories');
    var Supplier = require('../src/core/supplier');
    var Buyer = require('../core/buyer');
    var UoM_Template = require('../src/core/UoM').UoM_Template;
    var UoM = require('../src/core/UoM').UoM;
    var AccessoriesValue = require('../src/po/accessories-value');
    var Accessories = require('../src/core/accessories');

    var pOGarmentAccessories = new POGarmentAccessories();
    pOGarmentAccessories.RONo = '164806';
    pOGarmentAccessories.PRNo = '161700';
    pOGarmentAccessories.PONo = 'PO1622548';
    pOGarmentAccessories.Article = 'DL/01/01';
    pOGarmentAccessories.ppn = 10;
    pOGarmentAccessories.deliveryDate = new Date();
    pOGarmentAccessories.termOfPayment = 'Tempo 2 bulan';
    pOGarmentAccessories.deliveryFee = 10000;
    pOGarmentAccessories.PODLNo = '';
    pOGarmentAccessories.description = 'SP1';
    pOGarmentAccessories.supplierId = {};
    pOGarmentAccessories.buyerId = {};

    var supplier = new Supplier({
        code: 'S01',
        name: 'Soraya',
        PIC: 'garment',
        contact: '081200025',
        address: 'test',
        import: true
    });

    var buyer = new Buyer({
        code: 'B01',
        name: 'Buyer1',
        contact: '0812000256',
        address: 'test',
        tempo: 0
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

    var accessories = new Accessories({
        code: '7',
        name: 'hotline',
        description: 'hotline123',
        UoM: _uom
    });

    var accessoriesValue = new AccessoriesValue({
        qty: 0,
        unit: '',
        price: 0,
        accessories: accessories
    });
    var _accessories = [];
    _accessoriess.push(accessoriesValue);

    pOGarmentAccessories.supplier = supplier;
    pOGarmentAccessories.buyer = buyer;
    pOGarmentAccessories.items = _accessories;
    validate.POGarmentAccessories(pOGarmentAccessories);

})


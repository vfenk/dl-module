var validate = require('../src/validator').po;

it("#06. PO Garment SparePart should valid", function () {
    var POGarmentSparepart = require('../src/po/PO-garment-sparepart');
    
    validate.POGarmentSparepart(new POGarmentSparepart());
})


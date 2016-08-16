var validate = require('../src/validator').po;

it("#06. PO Textile Job Order  should valid", function () {
    var POTextileJobOrder = require('../src/po/PO-textile-joborder');
    
    validate.POTextileJobOrder(new POTextileJobOrder());
})


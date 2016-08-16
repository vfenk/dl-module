var validate = require('../src/validator').po;

it("#01. Purchase Order should valid", function () {
    var PurchaseOrder = require('../src/po/purchase-order');
    validate.PurchaseOrder(new PurchaseOrder());
})


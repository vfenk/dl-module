var validate = require('../src/validator').po;

it("#07. Purchase Order Group should valid", function () {
    var PurchaseOrderGroup = require('../src/po/purchase-order-group');
    validate.PurchaseOrderGroup(new PurchaseOrderGroup());
})


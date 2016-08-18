var test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}


test('@buyer', './buyer');
test('@supplier', './supplier');
test('@product', './product');
test('@uom', './UoM');
test('@PurchaseOrder', './purchase-order-test');
test('@PurchaseOrderGroup', './purchase-order-group-test');

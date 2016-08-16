var test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}

test('@accessories', './accessories');
test('@fabric', './fabric');
test('@textile', './textile');
test('@sparepart', './sparepart');
test('@general-merchandise', './general-merchandise');
test('@buyer', './buyer');
test('@supplier', './supplier');
test('@uom', './UoM');
test('@PurchaseOrder', './purchase-order-test');

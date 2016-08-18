var test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}


test('@buyer', './buyer');
test('@supplier', './supplier');
test('@product', './product');
test('@uom', './UoM');
// test('@POGarmentSparepart', './PO-garment-sparepart-test');
 test('@POTextileJobOrder','./po-textile-joborder-test');
test('@PurchaseOrder', './purchase-order-test');

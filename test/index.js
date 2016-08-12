var test = function (name, path) {
    describe(name, function () {
        require(path);
    })
}

test('@accessories', './accessories');
test('@fabric', './fabric');
test('@textile', './textile');
test('@uom', './UoM');
test('@sparepart', './sparepart');
test('@general-merchandise', './general-merchandise');
test('@buyers', './buyer');
test('@suppliers', './supplier');
test('@uom', './UoM');
test('@POGarmentSparepart', './PO-garment-sparepart-test');

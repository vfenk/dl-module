function test(name, path) {
    describe(name, function () {
        require(path);
    })
}


describe('#dl-module', function (done) {

    this.timeout(2 * 60000);
    //console.log(path);

    // Master 

    test('@master/uom-manager', './master/uom-manager-test');
    test('@master/supplier-manager', './master/supplier-manager-test');
    test('@master/buyer-manager', './master/buyer-manager-test');
    test('@master/product-manager', './master/product-manager-test');
    test('@master/unit-manager', './master/unit-manager-test');
    test('@master/category-manager', './master/category-manager-test');
 

    //PO
    // test('@po/po-garment-sparepart-manager', './po/po-garment-sparepart-manager-test');
    // test('@po/po-textile-sparepart-manager', './po/po-textile-sparepart-manager-test');
    // test('@po/po-garment-general-manager', './po/po-garment-general-manager-test');
    // test('@po/po-textile-job-order-external-manager', './po/po-textile-job-order-external-manager-test');
    // test('@po/purchase-order-group-manager', './po/purchase-order-group-manager-test');
    // test('@po/purchase-order-group-test-percentage-manager', './po/purchase-order-group-test-percentage-manager-test');
    // test('@po/po-garment-accessories-manager', './po/po-garment-accessories-manager-test');
    // test('@po/po-garment-job-order-accessories-manager', './po/po-garment-job-order-accessories-manager-test');
    // test('@po/po-textile-general-atk-manager', './po/po-textile-general-atk-manager-test');
    // test('@po/po-garment-fabric-manager', './po/po-garment-fabric-manager-test');
    // test('@po/po-textile-general-other-atk-manager', './po/po-textile-general-other-atk-manager-test');
    // test('@po/po-garment-job-order-fabric-manager', './po/po-garment-job-order-fabric-manager-test');
    // test('@SuratJalan', './surat-jalan/surat-jalan-test');    
    // test('@po/po-textile-manager', './po/po-textile-manager-test');

    // test('@po/purchase-order-base-manager', './po/purchase-order-base-manager-test');
    // test('@po/purchase-order-test-percentage-manager', './po/purchase-order-test-percentage-manager-test');
})
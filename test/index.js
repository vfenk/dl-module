function test(name, path) {
    describe(name, function () {
        require(path);
    })
}


describe('#dl-module', function (done) {

    this.timeout(2 * 60000);
    //console.log(path);

    // Master
    // test('@master/uom-manager', './master/uom-manager-test');
    // test('@master/supplier-manager', './master/supplier-manager-test');
    // test('@master/buyer-manager', './master/buyer-manager-test');
    // test('@master/product-manager', './master/product-manager-test');

    //Purchasing 
    test('@purchasing/purchase-order-base-manager', './purchasing/purchase-order-manager-test');
    test('@purchasing/purchase-order-external-manager', './purchasing/purchase-order-external-manager-test');
})
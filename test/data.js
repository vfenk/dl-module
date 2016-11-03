module.exports = {
    master: {
        product: require('./data-util/master/product-data-util'),
        uom: require('./data-util/master/uom-data-util'),
        vat: require('./data-util/master/vat-data-util'),
        currency: require('./data-util/master/currency-data-util'),
        buyer: require('./data-util/master/buyer-data-util'),
        budget: require('./data-util/master/budget-data-util'),
        supplier: require('./data-util/master/supplier-data-util'),
        unit: require('./data-util/master/unit-data-util'),
        category: require('./data-util/master/category-data-util')
    },
    transaction: {
        purchaseRequest: require('./data-util/transaction/purchase-request-data-util'),
        purchaseOrder: require('./data-util/transaction/purchase-order-data-util'),
        purchaseOrderExternal: require('./data-util/transaction/purchase-order-external-data-util')
    }
};

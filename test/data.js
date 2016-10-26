module.exports = {
    master: {
        product: require('./data-util/master/product-data-util'),
        uom: require('./data-util/master/uom-data-util')
    },
    transaction: {
        purchaseRequest: require('./data-util/transaction/purchase-request-data-util')
    }
};

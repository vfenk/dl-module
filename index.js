module.exports = {
    managers: {
        master: {
            BuyerManager: require("./src/managers/master/buyer-manager"),
            SupplierManager: require("./src/managers/master/supplier-manager"),
            ProductManager: require("./src/managers/master/product-manager"),
            CategoryManager: require('./src/managers/master/category-manager'),
            UnitManager: require('./src/managers/master/unit-manager')
        },
        purchasing: {
            PurchaseOrderManager: require('./src/managers/purchasing/purchase-order-manager'),
            PurchaseOrderExternalManager: require('./src/managers/purchasing/purchase-order-external-manager'),
            DeliveryOrderManager: require('./src/managers/purchasing/delivery-order-manager')
        },
    }
}

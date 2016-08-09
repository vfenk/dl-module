module.exports = {
    managers: {
        core: {
            ProductManager: require("./src/managers/core/product-manager"),
            BuyerManager: require("./src/managers/core/buyer-manager"),
            SupplierManager: require("./src/managers/core/supplier-manager"),
            AccessoriesManager: require("./src/managers/core/accessories-manager")
        }
    },
    ValidationError: require('./src/validation-error')
}
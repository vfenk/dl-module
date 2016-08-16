module.exports = {
    core: {
            product: require("./core/product-validator"),
            buyer: require("./core/buyer-validator"),
            supplier: require("./core/supplier-validator"),
            UoM: require("./core/UoM-validator"),
            UoMTemplate: require("./core/UoM-template-validator"),
    },
    po: {
            PurchaseOrder: require("./po/purchase-order-validator"),
            PurchaseOrderItem: require("./po/purchase-order-item-validator"),
    }
};
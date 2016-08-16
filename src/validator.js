module.exports = {
    core: {
       
            accessories: require("./core/accessories-validator"),
            buyer: require("./core/buyer-validator"),
            fabric: require("./core/fabric-validator"),
            generalMerchandise: require("./core/general-merchandise-validator"),
            sparepart: require("./core/sparepart-validator"),
            supplier: require("./core/supplier-validator"),
            textile: require("./core/textile-validator"),
            UoM: require("./core/UoM-validator"),
            UoMTemplate: require("./core/UoM-template-validator"),
    },
    po: {
            PurchaseOrder: require("./po/purchase-order-validator"),
            PurchaseOrderItem: require("./po/purchase-order-item-validator"),
    }
};
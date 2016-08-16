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
            POGarmentSparepart: require("./po/po-garment-sparepart-validator"),
            sparepartValue: require("./po/sparepart-value-validator"),
            POTextileJobOrder: require("./po/po-textile-joborder-validator"),
            TextileValue: require("./po/textile-value-validator"),
            PurchaseOrder: require("./po/purchase-order-validator"),
            PurchaseOrderItem: require("./po/purchase-order-item-validator"),
    }
};
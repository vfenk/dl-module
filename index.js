
module.exports = {
    core: {
        Fabric: require('./src/core/fabric'),
        Buyer: require('./src/core/buyer'),
        Supplier: require('./src/core/supplier'),
        Textile: require('./src/core/textile'),
        Accessories: require('./src/core/accessories'),
        Sparepart: require('./src/core/sparepart'),
        UoM: require('./src/core/UoM').UoM,
        UoM_Template: require('./src/core/UoM').UoM_Template,
        GeneralMerchandise: require('./src/core/general-merchandise')
    },
    po: {
        PurchaseOrderItem: require('./src/po/purchase-order-item'),
        PurchaseOrder: require('./src/po/purchase-order')
    },
    map: require('./src/map'),
    validator: require('./src/validator')
}

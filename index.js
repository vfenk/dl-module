
module.exports = {
    core: {
        Product: require('./src/core/product'),
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
        PurchaseOrder: require('./src/po/purchase-order'),
        PurchaseOrderGroup: require('./src/po/purchase-order-group'),
        POGarmentGeneral: require('./src/po/PO-garment-general'),
        POGroupGarmentGeneral: require('./src/po/purchase-order-group-garment-general'),
        POGarmentSparepart: require('./src/po/po-garment-sparepart'),
        POTextileJobOrder: require('./src/po/po-textile-job-order-external')
    },
    map: require('./src/map'),
    validator: require('./src/validator')
}

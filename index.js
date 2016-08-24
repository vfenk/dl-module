
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
        POGarmentGeneral: require('./src/po/purchase-order-garment-general'),
        POGarmentSparepart: require('./src/po/purchase-order-garment-sparepart'),
        POTextileJobOrder: require('./src/po/purchase-order-textile-job-order-external'),
        POGarmentAccessories: require('./src/po/purchase-order-garment-accessories'),
        POGarmentFabric: require('./src/po/purchase-order-garment-fabric'),
        StandardQualityTestPercentage: require('./src/po/standard-quality-test-percentage'),
        POTextileGeneralATK: require('./src/po/purchase-order-textile-general-atk')

    },
    map: require('./src/map'),
    validator: require('./src/validator')
}

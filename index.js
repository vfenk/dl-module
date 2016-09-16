module.exports = {
    managers: {
        core: {
            BuyerManager: require("./src/managers/core/buyer-manager"),
            SupplierManager: require("./src/managers/core/supplier-manager"),
            ProductManager: require("./src/managers/core/product-manager"),
            SparepartManager: require("./src/managers/core/sparepart-manager"),
            AccessoriesManager: require("./src/managers/core/accessories-manager"),
            TextileManager: require('./src/managers/core/textile-manager'),
            FabricManager: require('./src/managers/core/fabric-manager'),
            GeneralMerchandiseManager: require('./src/managers/core/general-merchandise-manager'),
            UomManager: require('./src/managers/core/uom-manager')
        },
        po: {
            PurchaseOrder: require('./src/managers/po/purchase-order-manager'),
            PurchaseOrderGroup: require('./src/managers/po/purchase-order-group-manager'),
            POGarmentSparepart: require('./src/managers/po/po-garment-sparepart-manager'),
            POTextileSparepart: require('./src/managers/po/po-textile-sparepart-manager'),
            POGarmentGeneral: require('./src/managers/po/po-garment-general-manager'),
            POTextileJobOrderManager: require('./src/managers/po/po-textile-job-order-external-manager'),
            POGarmentAccessories: require('./src/managers/po/po-garment-accessories-manager'),
            POGarmentJobOrderAccessoriesManager: require('./src/managers/po/po-garment-job-order-accessories-manager'),
            POTextileGeneralATK: require('./src/managers/po/po-textile-general-atk-manager'),
            POGarmentFabric: require('./src/managers/po/po-garment-fabric-manager'),
            POTextileGeneralOtherATK: require('./src/managers/po/po-textile-general-other-atk-manager'),
            POGarmentJobOrderFabric: require('./src/managers/po/po-garment-job-order-fabric-manager'),
            POTextile: require('./src/managers/po/po-textile-manager'),
            PurchaseOrderBaseManager: require('./src/managers/po/purchase-order-base-manager'),
            PurchaseOrderTestPercentageManager: require('./src/managers/po/purchase-order-test-percentage-manager'),
            PurchaseOrderGroupManager: require('./src/managers/po/purchase-order-group-manager'),
            PurchaseOrderGroupTestPercentageManager: require('./src/managers/po/purchase-order-group-test-percentage-manager')
        },
        suratJalan: {
            SuratJalan: require("./src/managers/surat-jalan/surat-jalan-manager")
        },
    }
}

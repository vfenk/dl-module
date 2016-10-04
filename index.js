module.exports = {
    managers: {
        auth: {
            AccountManager: require("./src/managers/auth/account-manager"),
            RoleManager: require("./src/managers/auth/role-manager")
        },
        master: {
            BuyerManager: require("./src/managers/master/buyer-manager"),
            SupplierManager: require("./src/managers/master/supplier-manager"),
            ProductManager: require("./src/managers/master/product-manager"),
            CategoryManager: require('./src/managers/master/category-manager'),
            UnitManager: require('./src/managers/master/unit-manager'),
            UomManager: require('./src/managers/master/uom-manager'),
            CurrencyManager: require('./src/managers/master/currency-manager'),
            VatManager: require('./src/managers/master/vat-manager'),
        },
        // costCalculation:{
        //     //CostCalculationManager: require("./src/managers/cost-calculation/cost-calculation-manager")
        // },
        // po: {
        //     // PurchaseOrder: require('./src/managers/po/purchase-order-manager'),
        //     // PurchaseOrderGroup: require('./src/managers/po/purchase-order-group-manager'),
        //     // POGarmentSparepart: require('./src/managers/po/po-garment-sparepart-manager'),
        //     // POTextileSparepart: require('./src/managers/po/po-textile-sparepart-manager'),
        //     // POGarmentGeneral: require('./src/managers/po/po-garment-general-manager'),
        //     // POTextileJobOrderManager: require('./src/managers/po/po-textile-job-order-external-manager'),
        //     // POGarmentAccessories: require('./src/managers/po/po-garment-accessories-manager'),
        //     // POGarmentJobOrderAccessoriesManager: require('./src/managers/po/po-garment-job-order-accessories-manager'),
        //     // POTextileGeneralATK: require('./src/managers/po/po-textile-general-atk-manager'),
        //     // POGarmentFabric: require('./src/managers/po/po-garment-fabric-manager'),
        //     // POTextileGeneralOtherATK: require('./src/managers/po/po-textile-general-other-atk-manager'),
        //     // POGarmentJobOrderFabric: require('./src/managers/po/po-garment-job-order-fabric-manager'),
        //     POTextile: require('./src/managers/po/po-textile-manager')
        // },
        // suratJalan: {
        //    // SuratJalan: require("./src/managers/surat-jalan/surat-jalan-manager")
        // },
        purchasing: {
            PurchaseOrderManager: require('./src/managers/purchasing/purchase-order-manager'),
            PurchaseOrderExternalManager: require('./src/managers/purchasing/purchase-order-external-manager'),
            DeliveryOrderManager: require('./src/managers/purchasing/delivery-order-manager')
        }
        // reports:{
        //     POUnitPeriode : require('./src/managers/reports/purchase-order-unit-periode-manager')
        // }
    }
}

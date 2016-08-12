
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
        SparepartValue: require('./src/po/sparepart-value'),
        POGarmentSparePart: require('./src/po/PO-garment-sparepart')
    },
    map: require('./src/map'),
    validator: require('./test/validator')
}
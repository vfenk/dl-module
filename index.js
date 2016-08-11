
module.exports = {
    core: {
        Product: require('./src/core/product'),
        Fabric: require('./src/core/fabric'),
        Buyer: require('./src/core/buyer'),
        Supplier: require('./src/core/supplier'),
        Textile: require('./src/core/textile'),
        Accessories: require('./src/core/accessories'),
<<<<<<< HEAD
        UoM: require('./src/core/UoM').UoM,
        UoM_Template: require('./src/core/UoM').UoM_Template
=======
        Sparepart: require('./src/core/sparepart'),
        UoM: require('./src/core/UoM-docs').UoM,
        UoM_Template: require('./src/core/UoM-docs').UoM_Template
>>>>>>> 0497f73247decc757c586fc057001d5a47833177
    },
    map: require('./src/map'),
    validator: require('./test/validator')

}

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
    }
};
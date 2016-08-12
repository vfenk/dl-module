if (process.env.NODE_ENV == 'production') {
    exports = {};
}
else {

    var should = require('should');

    
    var validateSparepart = function (data) {
        data.should.not.equal(null);
        data.should.instanceof(Object);

        data.should.have.property('code');
        data.code.should.instanceof(String);

        data.should.have.property('name');
        data.name.should.instanceof(String);

        data.should.have.property('description');
        data.description.should.instanceof(String);
        
        data.should.have.property('supplierId');
        data.supplierId.should.instanceof(Object);
        
        data.should.have.property('supplier');
        data.supplier.should.instanceof(Object);
        
        data.should.have.property('price');
        data.price.should.instanceof(Number);

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);
        
        validateUoMDocs(data.UoM);


    

    var validateTextile = function (data) {
        data.should.not.equal(null);
        data.should.instanceof(Object);

        data.should.have.property('code');
        data.code.should.instanceof(String);

        data.should.have.property('name');
        data.name.should.instanceof(String);

        data.should.have.property('description');
        data.description.should.instanceof(String);

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);

        validateUoMDocs(data.UoM);
    }

    var validateFabric = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.instanceOf(String);

        data.should.have.property('name');
        data.name.should.instanceOf(String);

        data.should.have.property('composition');
        data.composition.should.instanceOf(String);

        data.should.have.property('construction');
        data.construction.should.instanceOf(String);

        data.should.have.property('thread');
        data.thread.should.instanceOf(String);

        data.should.have.property('width');
        data.width.should.instanceOf(Number);

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);

        validateUoMDocs(data.UoM);
    }

    var validateAccessories = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.be.String();

        data.should.have.property('name');
        data.name.should.be.String();

        data.should.have.property('description');
        data.description.should.be.String();

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);

        validateUoMDocs(data.UoM);
    }

    var validateUoMDocs = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('category');
        data.category.should.be.String();

        data.should.have.property('default');
        data.default.should.instanceOf(Object);
        validateUoMTemplate(data.default);

        data.should.have.property('units');
        data.units.should.instanceOf(Array);

        for (var unit of data.units) {
            validateUoMTemplate(unit);
        }
    }

    var validateUoMTemplate = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('mainValue');
        data.mainValue.should.instanceOf(Number);

        data.should.have.property('mainUnit');
        data.mainUnit.should.instanceOf(String);

        data.should.have.property('convertedValue');
        data.convertedValue.should.instanceOf(Number);

        data.should.have.property('convertedUnit');
        data.convertedUnit.should.instanceOf(String);
    }
    
    var validateGeneralMerchandise = function (data) {
        data.should.not.equal(null);
        data.should.instanceof(Object);

        data.should.have.property('code');
        data.code.should.instanceof(String);

        data.should.have.property('name');
        data.name.should.instanceof(String);

        data.should.have.property('description');
        data.description.should.instanceof(String);
        
        data.should.have.property('price');
        data.price.should.instanceof(Number);
        
        data.should.have.property('supplierId');
        data.supplierId.should.instanceof(Object);
        
        data.should.have.property('supplier');
        data.supplier.should.instanceof(Object);

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);
        validateUoMDocs(data.UoM);
    }

    var validateBuyer = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.instanceOf(String);

        data.should.have.property('name');
        data.name.should.instanceOf(String);

        data.should.have.property('address');
        data.address.should.instanceOf(String);
        
        data.should.have.property('contact');
        data.contact.should.instanceOf(String);

        data.should.have.property('tempo');
        data.tempo.should.instanceOf(String);
    }
    
    var validateSupplier = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.instanceOf(String);

        data.should.have.property('name');
        data.name.should.instanceOf(String);

        data.should.have.property('address');
        data.address.should.instanceOf(String);
        
        data.should.have.property('contact');
        data.contact.should.instanceOf(String);

        data.should.have.property('import');
        data.import.should.instanceOf(Boolean);
    }

    var validateGeneralMerchandise = function (data) {
        data.should.not.equal(null);
        data.should.instanceof(Object);

        data.should.have.property('code');
        data.code.should.instanceof(String);

        data.should.have.property('name');
        data.name.should.instanceof(String);

        data.should.have.property('description');
        data.description.should.instanceof(String);

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);
        validateUoMDocs(data.UoM);
    }

    var validateBuyer = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.instanceOf(String);

        data.should.have.property('name');
        data.name.should.instanceOf(String);

        data.should.have.property('address');
        data.address.should.instanceOf(String);

        data.should.have.property('contact');
        data.contact.should.instanceOf(String);

        data.should.have.property('tempo');
        data.tempo.should.instanceOf(String);
    }

    var validateSupplier = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.instanceOf(String);

        data.should.have.property('name');
        data.name.should.instanceOf(String);

        data.should.have.property('address');
        data.address.should.instanceOf(String);

        data.should.have.property('contact');
        data.contact.should.instanceOf(String);

        data.should.have.property('import');
        data.import.should.instanceOf(Boolean);
    }

    var validateSparepartValue = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('qty');
        data.qty.should.instanceOf(Number);

        data.should.have.property('unit');
        data.unit.should.instanceOf(String);

        data.should.have.property('price');
        data.price.should.instanceOf(Number);

        data.should.have.property('sparepart');
        data.sparepart.should.instanceof(Object);
        validateSparepart(data.sparepart);

    }
var validateSparepart = function (data) {
        data.should.not.equal(null);
        data.should.instanceof(Object);

        data.should.have.property('code');
        data.code.should.instanceof(String);

        data.should.have.property('name');
        data.name.should.instanceof(String);

        data.should.have.property('description');
        data.description.should.instanceof(String);

        data.should.have.property('UoM');
        data.UoM.should.instanceOf(Object);
        validateUoMDocs(data.UoM);

    }
    var validatePOGarmentSparePart = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('RONo');
        data.PRNo.should.instanceOf(String);

        data.should.have.property('PRNo');
        data.PRNo.should.instanceOf(String);

        data.should.have.property('PONo');
        data.PONo.should.instanceOf(String);

        //  data.should.have.property('supplierId');
        //  data.supplierId.should.instanceof(Object);

        data.should.have.property('supplier');
        data.supplier.should.instanceof(Object);
        validateSupplier(data.supplier);

        // data.should.have.property('itemId');
        // data.itemId.should.instanceof(Object);

        data.should.have.property('ppn');
        data.ppn.should.instanceOf(Number);

        data.should.have.property('deliveryDate');
        data.deliveryDate.should.instanceOf(Date);

        data.should.have.property('termOfPayment');
        data.termOfPayment.should.instanceOf(String);

        data.should.have.property('deliveryFeeByBuyer');
        data.deliveryFeeByBuyer.should.instanceOf(Boolean);

        data.should.have.property('PODLNo');
        data.PODLNo.should.instanceOf(String);

        data.should.have.property('description');
        data.description.should.instanceOf(String);

        data.should.have.property('items');
        data.items.should.instanceOf(Array);
        for (var item of data.items) {
            validateSparepartValue(item);
        }
    }

    exports.core = {
        fabric: validateFabric,
        textile: validateTextile,
        accessories: validateAccessories,
        sparepart: validateSparepart,
        UoMDocs: validateUoMDocs,
        generalMerchandise: validateGeneralMerchandise,
        buyer: validateBuyer,
        supplier: validateSupplier
    }
    exports.po = {
        POGarmentSparePart: validatePOGarmentSparePart
    }
}
require("should");
var validateUoMDocs = require('./uom-validator');

module.exports = function (data) {
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
require("should");
var validateSparepart = require('../core/sparepart-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('qty');
    data.qty.should.instanceOf(Number);

    data.should.have.property('unit');
    data.unit.should.instanceOf(String);

    data.should.have.property('price');
    data.price.should.instanceOf(Number);

    data.should.have.property('sparepartId');
    data.sparepartId.should.instanceof(Object);

    data.should.have.property('sparepart');
    data.sparepart.should.instanceof(Object);
    validateSparepart(data.sparepart);
    
}
require("should");
var validateTextile = require('../core/textile-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('qty');
    data.qty.should.instanceOf(Number);

    data.should.have.property('unit');
    data.unit.should.instanceOf(String);

    data.should.have.property('price');
    data.price.should.instanceOf(Number);

    data.should.have.property('textile');
    data.textile.should.instanceof(Object);

    validateTextile(data.textile);
}
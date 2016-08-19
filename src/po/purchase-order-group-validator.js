require("should");
var validatePurchaseOrder = require('./purchase-order-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('PODLNo');
    data.PODLNo.should.be.String();

    data.should.have.property('items');
    data.items.should.instanceOf(Array);

    for (var item of data.items) {
        validatePurchaseOrder(item);
    }
}
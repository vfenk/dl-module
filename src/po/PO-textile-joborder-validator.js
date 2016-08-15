require("should");
var validateBuyer = require('../core/buyer-validator');
var validateSupplier = require('../core/supplier-validator');
var validateTeextileValue = require('./textile-value-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('RONo');
    data.PRNo.should.instanceOf(String);

    data.should.have.property('PRNo');
    data.PRNo.should.instanceOf(String);

    data.should.have.property('PONo');
    data.PONo.should.instanceOf(String);

    data.should.have.property('buyerId');
    data.buyerId.should.instanceof(Object);

    data.should.have.property('buyer');
    data.buyer.should.instanceof(Object);
    validateBuyer(data.buyer);
    
    data.should.have.property('supplierId');
    data.supplierId.should.instanceof(Object);

    data.should.have.property('supplier');
    data.supplier.should.instanceof(Object);
    validateSupplier(data.supplier);

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
        validateTextileValue(item);
    }
}
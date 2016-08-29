require("should");
var validatePurchaseOrder = require('./purchase-order-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('PODLNo');
    data.PODLNo.should.be.String();

    data.should.have.property('supplierId');
    data.supplierId.should.instanceof(Object);

    data.should.have.property('supplier');
    data.supplier.should.instanceof(Object);
    validateSupplier(data.supplier);

    data.should.have.property('termOfPayment');
    data.termOfPayment.should.instanceOf(String);

    data.should.have.property('usePPn');
    data.usePPn.should.instanceOf(Boolean);

    data.should.have.property('usePPh');
    data.usePPh.should.instanceOf(Boolean);
    
    data.should.have.property('deliveryDate');
    data.deliveryDate.should.instanceOf(Date);

    data.should.have.property('deliveryFeeByBuyer');
    data.deliveryFeeByBuyer.should.instanceOf(Boolean);
   
    data.should.have.property('paymentDue');
    data.paymentDue.should.instanceOf(Number);

    data.should.have.property('description');
    data.description.should.instanceOf(String);

    data.should.have.property('currency');
    data.currency.should.instanceOf(String);

    data.should.have.property('items');
    data.items.should.instanceOf(Array);

    for (var item of data.items) {
        validatePurchaseOrder(item);
    }
}
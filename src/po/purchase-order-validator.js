require("should");
var validateSupplier = require('../core/supplier-validator');
var validateBuyer  = require('../core/buyer-validator');
var validatePurchaseOrderItem = require('./purchase-order-item-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);
    
    data.should.have.property('iso');
    data.iso.should.instanceOf(String);
    
    data.should.have.property('RONo');
    data.RONo.should.instanceOf(String);
    
    data.should.have.property('PRNo');
    data.PRNo.should.instanceOf(String);

    data.should.have.property('PONo');
    data.PONo.should.instanceOf(String);
    
    data.should.have.property('RefPONo');
    data.RefPONo.should.instanceOf(String);

    data.should.have.property('article');
    data.article.should.instanceOf(String);
    
    data.should.have.property('buyerId');
    data.buyerId.should.instanceof(Object);

    data.should.have.property('buyer');
    data.buyer.should.instanceof(Object);
    validateBuyer(data.buyer);
    
    data.should.have.property('PODLNo');
    data.PODLNo.should.instanceOf(String);

    data.should.have.property('items');
    data.items.should.instanceOf(Array);
    for (var item of data.items) {
        validatePurchaseOrderItem(item);
    }
}
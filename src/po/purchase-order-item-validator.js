require("should");
var validateProduct = require('../core/product-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('qty');
    data.qty.should.instanceOf(Number);

    data.should.have.property('price');
    data.price.should.instanceOf(Number);

    data.should.have.property('product');
    data.product.should.instanceof(Object);
    validateProduct(data.product);
    
}
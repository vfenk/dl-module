require("should");
var validateProduct = require('../core/product-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('quantity');
    data.quantity.should.instanceOf(Number);

    data.should.have.property('description');
    data.description.should.instanceOf(Number);

    data.should.have.property('dealQuantity');
    data.dealQuantity.should.instanceOf(Number);

    data.should.have.property('dealMeasurement');
    data.dealMeasurement.should.instanceOf(String);

    data.should.have.property('defaultMeasurementQuantity');
    data.defaultMeasurementQuantity.should.instanceOf(Number);

    data.should.have.property('defaultMeasurement');
    data.defaultMeasurement.should.instanceOf(String);
    
    data.should.have.property('product');
    data.product.should.instanceof(Object);
    validateProduct(data.product);
    
}
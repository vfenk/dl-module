require("should");
var validateProductDetail = require('./product-detail-validator');
var validateUoMDocs = require('./UoM-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('code');
    data.code.should.be.String();

    data.should.have.property('name');
    data.name.should.be.String();

    data.should.have.property('price');
    data.price.should.instanceOf(Number);

    data.should.have.property('description');
    data.description.should.be.String();

    data.should.have.property('UoM');
    data.UoM.should.instanceOf(Object);
    validateUoMDocs(data.UoM);

    data.should.have.property('detail');
    data.detail.should.instanceOf(Object);
    validateProductDetail(data.detail);
}
require("should");
var validateUoMDocs = require('./UoM-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceof(Object);

    data.should.have.property('code');
    data.code.should.instanceof(String);

    data.should.have.property('name');
    data.name.should.instanceof(String);

    data.should.have.property('description');
    data.description.should.instanceof(String);

    data.should.have.property('UoM');
    data.UoM.should.instanceOf(Object);

    validateUoMDocs(data.UoM);
}
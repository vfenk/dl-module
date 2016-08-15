require("should");
var validateUoMDocs = require('./uom-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('code');
    data.code.should.instanceOf(String);

    data.should.have.property('name');
    data.name.should.instanceOf(String);

    data.should.have.property('composition');
    data.composition.should.instanceOf(String);

    data.should.have.property('construction');
    data.construction.should.instanceOf(String);

    data.should.have.property('thread');
    data.thread.should.instanceOf(String);

    data.should.have.property('width');
    data.width.should.instanceOf(Number);

    data.should.have.property('UoM');
    data.UoM.should.instanceOf(Object);

    validateUoMDocs(data.UoM);
}

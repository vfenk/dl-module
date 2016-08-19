require("should");

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('mainValue');
    data.mainValue.should.instanceOf(Number);

    data.should.have.property('mainUnit');
    data.mainUnit.should.instanceOf(String);

    data.should.have.property('convertedValue');
    data.convertedValue.should.instanceOf(Number);

    data.should.have.property('convertedUnit');
    data.convertedUnit.should.instanceOf(String);
}
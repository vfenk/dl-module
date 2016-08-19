require("should");

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceof(Object);

    data.should.have.property('composition');
    data.composition.should.instanceOf(String);

    data.should.have.property('construction');
    data.construction.should.instanceOf(String);

    data.should.have.property('yarn');
    data.yarn.should.instanceOf(String);

    data.should.have.property('width');
    data.width.should.instanceOf(Number);
}
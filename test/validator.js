if (process.env.NODE_ENV == 'production') {
    exports = {};
}
else {

    var should = require('should');

    var validateTextile = function (data) {
        data.should.not.equal(null);
        data.should.instanceof(Object);

        data.should.have.property('code');
        data.code.should.instanceof(String);

        data.should.have.property('name');
        data.code.should.instanceof(String);

        data.should.have.property('description');
        data.description.should.instanceof(String);
    }

    var validateFabric = function (data) {
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

        data.should.have.property('largeUnit');
        data.largeUnit.should.instanceOf(String);

        data.should.have.property('smallUnit');
        data.smallUnit.should.instanceOf(String);
    }
    var validateAccessories = function (data) {
        data.should.not.equal(null);
        data.should.instanceOf(Object);

        data.should.have.property('code');
        data.code.should.be.String();

        data.should.have.property('name');
        data.name.should.be.String();

        data.should.have.property('description');
        data.description.should.be.String();
    }
    exports.core = {
        fabric: validateFabric,
        textile: validateTextile,
        accessories: validateAccessories

    }

}
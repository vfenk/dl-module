require("should");
var validateUoMTemplate = require('./UoM-template-validator');

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);

    data.should.have.property('category');
    data.category.should.be.String();

    data.should.have.property('default');
    data.default.should.instanceOf(Object);

    validateUoMTemplate(data.default);

    data.should.have.property('units');
    data.units.should.instanceOf(Array);

    for (var unit of data.units) {
        validateUoMTemplate(unit);
    }
}

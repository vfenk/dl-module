require("should");

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceof(Object);

    data.should.have.property('code');
    data.code.should.instanceof(String);

    data.should.have.property('name');
    data.name.should.instanceof(String);

    data.should.have.property('address');
    data.address.should.instanceof(String);

    data.should.have.property('contact');
    data.contact.should.instanceof(String);
    
    data.should.have.property('PIC');
    data.PIC.should.instanceof(String);

    data.should.have.property('import');
    data.import.should.be.Boolean();

}
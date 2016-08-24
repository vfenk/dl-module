require("should");

module.exports = function (data) {
    data.should.not.equal(null);
    data.should.instanceOf(Object);
    
    data.should.have.property('shrinkage');
    data.shrinkage.should.instanceOf(Number);
    
    data.should.have.property('wetRubbing');
    data.wetRubbing.should.instanceOf(Number);
    
    data.should.have.property('dryRubbing');
    data.dryRubbing.should.instanceOf(Number);
    
    data.should.have.property('washing');
    data.washing.should.instanceOf(Number);
    
    data.should.have.property('darkPrespiration');
    data.darkPrespiration.should.instanceOf(Number);
    
    data.should.have.property('lightMedPrespiration');
    data.lightMedPrespiration.should.instanceOf(Number);
}
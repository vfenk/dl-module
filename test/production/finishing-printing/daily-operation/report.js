require("should");
var ObjectId = require("mongodb").ObjectId;
var DailyOparationManager = require("../../../../src/managers/production/finishing-printing/daily-operation-manager");
var DailyOperationDataUtil = require("../../../data-util/production/finishing-printing/daily-operation-data-util");
var generateCode = require('../../../../src/utils/code-generator');
var Manager = null
var helper = require("../../../helper");

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            Manager = new DailyOparationManager(db, {
                username: 'dev'
            });
            done();
                       
        })
        .catch(e => {
            done(e);
        });
});
var daily = [];
it('#01. should success when create 5 Daily Operation data', function (done) {
    var data = []; 
    for (var i = 0; i < 5; i++) { 
        data.push(DailyOperationDataUtil.getNewData());
    } 
    Promise.all(data) 
        .then((result) => {
            for(var a of result){
                a.code = generateCode();
                daily.push(Manager.create(a));
            }
            Promise.all(daily)
                   .then(dataCreate => {
                       dataCreate.should.be.instanceof(Array);
                       dataCreate.length.should.equal(5);
                       for(var a of dataCreate){
                            a.should.instanceof(Object);
                       }
                       done();
                   }) 
            done(); 
        }).catch(e => {
            done(e);
        });
    
 });

it('#02. should success get 0 data report when search report without machine', function (done) {
    Manager.getDailyOperationReport()
    .then(data => {
            data.should.be.instanceof(Array);
            data.length.should.equal(0);
            done();
        }).catch(e => {
            done(e);
        });

});

it('#03. should success when get data report with machine parameter', function (done) {
    Manager.getDailyOperationReport(null, null, daily[0].machineId)
    .then(data => {
        data.should.instanceof(Array);
        done();
        }).catch(e => {
            done(e);
        });

});
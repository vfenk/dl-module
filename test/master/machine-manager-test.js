var helper = require("../helper");
var MachineManager = require("../../src/managers/master/machine-manager");
var instanceManager = null;
require("should");

function getData() {
    var Machine = require('dl-models').master.Machine;
    var machine = new Machine();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    machine.name = `name [${code}]`;
    machine.unit = `division [${code}]`;
    machine.process = `subdivision [${code}]`;
    machine.manufacture=`manufacture [${code}]`;
    machine.year = now.getFullYear();
    machine.machineCondition=`machine condition [${code}]`;

    return machine;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new MachineManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#01. should success when read data', function (done) {
    instanceManager.read()
        .then(documents => {
            //process documents
            documents.data.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#02. should success when create new data', function (done) {
    var data = getData();
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#03. should success when get created data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            // validate.product(data);
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#04. should success when update created data`, function (done) {

    createdData.name += '[updated]';
    createdData.unit += '[updated]';
    createdData.process += '[updated]';
    createdData.manufacture += '[updated]';
    createdData.year += '[updated]';
    createdData.machineCondition += '[updated]';

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#05. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            // validate.product(data);
            data.code.should.equal(createdData.code);
            data.name.should.equal(createdData.name);
            data.unit.should.equal(createdData.unit);
            data.process.should.equal(createdData.process);
            data.manufacture.should.equal(createdData.manufacture);
            data.year.should.equal(createdData.year);
            data.machineCondition.should.equal(createdData.machineCondition);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#06. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#07. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            // validate.product(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});
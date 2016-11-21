'use strict';

var should = require('should');
var helper = require("../../helper"); 
var DeliveryOrderManager = require("../../../src/managers/purchasing/delivery-order-manager"); 
var deliveryOrderManager = null;  
var deliveryOrder = require('../../data').transaction.deliveryOrder;
 
before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            deliveryOrderManager = new DeliveryOrderManager(db, {
                username: 'unit-test'
            }); 
            done();
        })
        .catch(e => {
            done(e);
        })
}); 

it('#01. should error when create with empty data ', function(done) {
    deliveryOrderManager.create({})
        .then(id => {
            done("should error when create with empty data");
        })
        .catch(e => {
            try {
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

var createdData;
it('#02. should success when create new data', function (done) {
    deliveryOrder.getNew()
        .then(data => {
            data.should.be.Object();
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#03. should success when delete data`, function (done) {
    deliveryOrderManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#04. should success when create new data with same code with deleted data', function (done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    deliveryOrderManager.create(data)
        .then(id => {
            id.should.be.Object(); 
            done();
        })
        .catch(e => {
            done();
        })
});

it('#05. should error when create new data with same code', function (done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    deliveryOrderManager.create(data)
        .then(id => {
            id.should.be.Object(); 
            done();
        })
        .catch(e => {
            e.errors.should.have.property('no');
            done();
        })
});
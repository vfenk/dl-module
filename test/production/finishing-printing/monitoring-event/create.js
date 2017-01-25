require("should");
var MonitoringEvent = require('../../../data-util/production/finishing-printing/monitoring-event-data-util');
var helper = require("../../../helper");
var validate = require("dl-models").validator.production.finishingPrinting.monitoringEvent;

var MonitoringEventManager = require("../../../../src/managers/production/finishing-printing/monitoring-event-manager");
var monitoringEventManager = null;

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            monitoringEventManager = new MonitoringEventManager(db, {
                username: 'dev'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#01. should error when create with empty data ', function (done) {
    monitoringEventManager.create({})
        .then(id => {
            done("should error when create with empty data");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('date');
                e.errors.should.have.property('timeInMillis');
                e.errors.should.have.property('machine');
                e.errors.should.have.property('productionOrder');
                e.errors.should.have.property('items');
                done();
            }
            catch (ex) {
                done(ex);
            }
        });
});

var monitoringEvent;
it('#02. should success when create new data', function (done) {
    MonitoringEvent.getNewTestData()
        .then(me => {
            monitoringEvent = me;
            validate(monitoringEvent);
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#03. should error when create new data using duplicate item', function (done) {
    MonitoringEvent.getNewData()
        .then(me => {
            me.items[1] = me.items[0];
            monitoringEventManager.create(me)
                .then(id => {
                    done("should error when create with empty data");
                })
                .catch(e => {
                    try {
                        e.errors.should.have.property('items');
                        done();
                    }
                    catch (ex) {
                        done(ex);
                    }
                });
        })
        .catch(e => {
            done(e);
        });
});

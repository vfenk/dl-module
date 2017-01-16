'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var MonitoringEvent = DLModels.production.finishingPrinting.MonitoringEvent;
var ProductManager = require('../../master/product-manager');
var MachineManager = require('../../master/machine-manager');
var UsterManager = require('../../master/uster-manager');
var UnitManager = require('../../master/unit-manager');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');


module.exports = class MonitoringEventManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.collection(map.production.finishingPrinting.collection.MonitoringEvent);
        this.machineManager = new MachineManager(db, user);
    }

    _getQuery(paging) {
        var deletedFilter = {
            _deleted: false
        }, keywordFilter = {};

        var query = {};
        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");

            var filterMachineName = {
                'machine.name': {
                    '$regex': regex
                }
            };

            var filterProductionOrderNumber = {
                "productionOrderNumber": {
                    '$regex': regex
                }
            };

            var filterMonitoringEventType = {
                "monitoringEventType": {
                    '$regex': regex
                }
            };

            keywordFilter = {
                '$or': [filterMachineName, filterProductionOrderNumber, filterMonitoringEventType]
            };
        }
        query = { '$and': [deletedFilter, paging.filter, keywordFilter] }
        return query;
    }

     _validate(monitoringEvent) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = monitoringEvent;
            var dateNow = new Date();
            var dateProcess = new Date(valid.date);
            
            var getMonitoringEvent = this.collection.singleOrDefault({
                "$and" : [{
                        _id : {
                            "$ne" : new ObjectId(valid._id)
                    }
                    },{
                        _deleted : false
                    },{
                        date : dateProcess
                    },{
                        usterId : valid.uster && ObjectId.isValid(valid.uster._id) ? (new ObjectId(valid.uster._id)) : ''
                    },{
                        machineId : valid.machine && ObjectId.isValid(valid.machine._id) ? (new ObjectId(valid.machine._id)) : ''
                    },{
                        unitId : valid.spinning && ObjectId.isValid(valid.spinning._id) ? (new ObjectId(valid.spinning._id)) : ''
                }]
            });
            var getMachine = valid.machine && ObjectId.isValid(valid.machine._id) ? this.machineManager.getSingleByIdOrDefault(valid.machine._id) : Promise.resolve(null);

            // 2. begin: Validation.
            Promise.all([getMonitoringEvent, getMachine])
                .then(result =>{
                    var _monitoringEvent = result[0];
                    var _machine = result[1];

                    if (!valid.date || valid.date == '')
                        errors["date"] = i18n.__("MonitoringEvent.date.isRequired:%s is required", i18n.__("MonitoringEvent.date._:Date")); //"Tanggal tidak boleh kosong";
                    else if (dateProcess > dateNow)
                        errors["date"] = i18n.__("MonitoringEvent.date.isGreater:%s is greater than today", i18n.__("MonitoringEvent.date._:Date"));//"Tanggal tidak boleh lebih besar dari tanggal hari ini";

                    if (!valid.time || valid.time == 0)
                        errors["time"] = i18n.__("MonitoringEvent.time.isRequired:%s is required", i18n.__("MonitoringEvent.time._:Time")); //"Time tidak boleh kosong";

                    if (!valid.machine)
                        errors["machine"] = i18n.__("MonitoringEvent.machine.name.isRequired:%s is required", i18n.__("MonitoringEvent.machine.name._:Machine")); //"Nama Mesin tidak boleh kosong";
                    else if(!_machine)
                        errors["machine"] = i18n.__("MonitoringEvent.machine.name.isNotExist:%s is not exists", i18n.__("MonitoringEvent.machine.name._:Machine")); //"Mesin sudah tidak ada di master mesin";

                    if (!valid.productionOrderNumber || valid.productionOrderNumber == '')
                        errors["productionOrderNumber"] = i18n.__("MonitoringEvent.productionOrderNumber.isRequired:%s is required", i18n.__("MonitoringEvent.productionOrderNumber._:ProductionOrderNumber")); //"ProductionOrderNumber tidak boleh kosong";

                    if (!valid.monitoringEventType || valid.monitoringEventType == '')
                        errors["monitoringEventType"] = i18n.__("MonitoringEvent.monitoringEventType.isRequired:%s is required", i18n.__("MonitoringEvent.monitoringEventType._:MonitoringEventType")); //"MonitoringEventType tidak boleh kosong";

                    if (!valid.description || valid.description == '')
                        errors["description"] = i18n.__("MonitoringEvent.description.isRequired:%s is required", i18n.__("MonitoringEvent.description._:Description")); //"Description tidak boleh kosong";

                    // 2c. begin: check if data has any error, reject if it has.
                     if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('module-toolkit').ValidationError ;
                        reject(new ValidationError('data does not pass validation', errors));
                    }
                    valid.machine = _machine;
                    valid.machineId = new ObjectId(_machine._id);

                    if(valid.date)
                        valid.date = dateProcess;
                    
                    if(!valid.stamp)
                        valid = new MonitoringEvent(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

     _createIndexes() {
        var dateIndex = {
            name: `ix_${map.production.finishingPrinting.collection.MonitoringEvent}__updatedDate`,

            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.production.finishingPrinting.collection.MonitoringEvent}_date_machineId`,
            key: {
                unitId: 1,
                date: 1,
                machineId: 1,
                usterId: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }
}
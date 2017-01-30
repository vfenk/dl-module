'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var MonitoringEvent = DLModels.production.finishingPrinting.MonitoringEvent;
var generateCode = require("../../../utils/code-generator");
var MonitoringEventTypeManager = require('../../master/monitoring-event-type-manager');
var MachineManager = require('../../master/machine-manager');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');
var moment = require('moment');


module.exports = class MonitoringEventManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.collection(map.production.finishingPrinting.collection.MonitoringEvent);
        
        this.monitoringEventTypeManager = new MonitoringEventTypeManager(db, user);
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

            var filterProductionOrder = {
                "productionOrder.orderNo": {
                    '$regex': regex
                }
            };

            var filterMonitoringEventType = {
                "monitoringEventType": {
                    '$regex': regex
                }
            };

            keywordFilter = {
                '$or': [filterMachineName, filterProductionOrder, filterMonitoringEventType]
            };
        }
        query = { '$and': [deletedFilter, paging.filter, keywordFilter] }
        return query;
    }

     _validate(monitoringEvent) {
        var errors = {};
        var valid = monitoringEvent;
        var dateNow = new Date();
        var dateNowString = moment(dateNow).format('YYYY-MM-DD');
        var timeInMillisNow = dateNow.getTime() % 86400000;
        var dateStart = new Date(valid.dateStart);
        var dateEnd = new Date(valid.dateEnd);

        var getMonitoringEventPromise = this.collection.singleOrDefault({
            _id: {
                '$ne': new ObjectId(valid._id)
            },
            code: valid.code
        });

        var getMachine = ObjectId.isValid(valid.machineId) ? this.machineManager.getSingleByIdOrDefault(new ObjectId(valid.machineId)) : Promise.resolve(null);
        var getMonitoringEventType = ObjectId.isValid(valid.monitoringEventTypeId) ? this.monitoringEventTypeManager.getSingleByIdOrDefault(new ObjectId(valid.monitoringEventTypeId)) : Promise.resolve(null);

        return Promise.all([getMonitoringEventPromise, getMachine, getMonitoringEventType])
            .then(results =>{
                var _monitoringEvent = results[0];
                var _machine = results[1];
                var _monitoringEventType = results[2];

                if (_monitoringEvent)
                    errors["code"] = i18n.__("MonitoringEvent.code.isExists:%s is exists", i18n.__("MonitoringEvent.code._:Code"));

                if (!valid.dateStart || valid.dateStart == '')
                    errors["dateStart"] = i18n.__("MonitoringEvent.dateStart.isRequired:%s is required", i18n.__("MonitoringEvent.dateStart._:Date Start")); //"Tanggal Mulai tidak boleh kosong";
                else if (dateStart > dateNow)
                    errors["dateStart"] = i18n.__("MonitoringEvent.dateStart.isGreater:%s is greater than today", i18n.__("MonitoringEvent.dateStart._:Date Start"));//"Tanggal Mulai tidak boleh lebih besar dari tanggal hari ini";
                else if (valid.dateStart === dateNowString && valid.timeInMillisStart > timeInMillisNow)
                    errors["timeInMillisStart"] = i18n.__("MonitoringEvent.timeInMillisStart.isGreater:%s is greater than today", i18n.__("MonitoringEvent.timeInMillisStart._:Time Start"));//"Time Mulai tidak boleh lebih besar dari time hari ini";

                if (!valid.dateEnd || valid.dateEnd == '')
                    errors["dateEnd"] = i18n.__("MonitoringEvent.dateEnd.isRequired:%s is required", i18n.__("MonitoringEvent.dateEnd._:Date End")); //"Tanggal Selesai tidak boleh kosong";
                else if (dateEnd > dateNow)
                    errors["dateEnd"] = i18n.__("MonitoringEvent.dateEnd.isGreater:%s is greater than today", i18n.__("MonitoringEvent.dateEnd._:Date End"));//"Tanggal Selesai tidak boleh lebih besar dari tanggal hari ini";
                else if (valid.dateEnd === dateNowString && valid.timeInMillisEnd > timeInMillisNow)
                    errors["timeInMillisEnd"] = i18n.__("MonitoringEvent.timeInMillisEnd.isGreater:%s is greater than today", i18n.__("MonitoringEvent.timeInMillisEnd._:Time End"));//"Time Selesai tidak boleh lebih besar dari time hari ini";

                if (valid.dateStart && valid.dateStart != '' && valid.dateEnd && valid.dateEnd != ''){
                    if (dateStart > dateEnd){
                        var errorMessage = i18n.__("MonitoringEvent.dateStart.isGreaterThanDateEnd:%s is greater than Date End", i18n.__("MonitoringEvent.dateStart._:Date Start")); //"Tanggal Mulai tidak boleh lebih besar dari Tanggal Selesai";
                        errors["dateStart"] = errorMessage;
                        errors["dateEnd"] = errorMessage;
                    }
                }

                if (!valid.timeInMillisStart || valid.timeInMillisStart === 0)
                    errors["timeInMillisStart"] = i18n.__("MonitoringEvent.timeInMillisStart.isRequired:%s is required", i18n.__("MonitoringEvent.timeInMillisStart._:Time Start")); //"Time Mulai tidak boleh kosong";

                if (!valid.timeInMillisEnd || valid.timeInMillisEnd === 0)
                    errors["timeInMillisEnd"] = i18n.__("MonitoringEvent.timeInMillisEnd.isRequired:%s is required", i18n.__("MonitoringEvent.timeInMillisEnd._:Time End")); //"Time Mulai tidak boleh kosong";

                if (valid.dateStart && valid.dateStart != '' && valid.dateEnd && valid.dateEnd != '' && valid.dateStart === valid.dateEnd){
                    if (valid.timeInMillisStart > valid.timeInMillisEnd){
                        var errorMessage = i18n.__("MonitoringEvent.timeInMillisStart.isGreaterThanTimeInMillisEnd:%s is greater than Time End", i18n.__("MonitoringEvent.timeInMillisStart._:Time Start")); //"Time Mulai tidak boleh lebih besar dari Time Selesai";
                        errors["timeInMillisStart"] = errorMessage;
                        errors["timeInMillisEnd"] = errorMessage;
                    }
                }    

                if (!_machine)
                    errors["machine"] = i18n.__("MonitoringEvent.machine.name.isRequired:%s is required", i18n.__("MonitoringEvent.machine.name._:Machine")); //"Nama Mesin tidak boleh kosong";

                if (!valid.productionOrder)
                    errors["productionOrder"] = i18n.__("MonitoringEvent.productionOrder.isRequired:%s is required", i18n.__("MonitoringEvent.productionOrder._:Production Order Number")); //"ProductionOrder tidak boleh kosong";

                if (!valid.selectedProductionOrderDetail)
                    errors["selectedProductionOrderDetail"] = i18n.__("MonitoringEvent.selectedProductionOrderDetail.isRequired:%s is required", i18n.__("MonitoringEvent.selectedProductionOrderDetail._:Color")); //"selectedProductionOrderDetail / Color tidak boleh kosong";

                if (!valid.cartNumber || valid.cartNumber == '')
                    errors["cartNumber"] = i18n.__("MonitoringEvent.cartNumber.isRequired:%s is required", i18n.__("MonitoringEvent.cartNumber._:Cart Number")); //"Nomor Kereta tidak boleh kosong";

                if (!_monitoringEventType)
                    errors["monitoringEventType"] = i18n.__("MonitoringEvent.monitoringEventType.isRequired:%s is required", i18n.__("MonitoringEvent.monitoringEventType._:Monitoring Event Type")); //"MonitoringEventType tidak boleh kosong";

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    var ValidationError = require("module-toolkit").ValidationError;
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                if (valid.dateStart)
                    valid.dateStart = dateStart;
                
                if (valid.dateEnd)
                    valid.dateEnd = dateEnd;

                if (_machine){
                    valid.machineId = _machine._id;
                    valid.machine = _machine;
                }

                if (_monitoringEventType){
                    valid.monitoringEventTypeId = _monitoringEventType._id;
                    valid.monitoringEventType = _monitoringEventType;
                }

                if (!valid.stamp)
                    valid = new MonitoringEvent(valid);
                    
                valid.stamp(this.user.username, 'manager');
                return Promise.resolve(valid);
            })
    }

    _beforeInsert(monitoringEvent) {
        monitoringEvent.code = generateCode();
        monitoringEvent._createdDate = new Date();
        return Promise.resolve(monitoringEvent);
    }

     _createIndexes() {
        var dateIndex = {
            name: `ix_${map.production.finishingPrinting.collection.MonitoringEvent}__updatedDate`,

            key: {
                _updatedDate: -1
            }
        }

        var codeIndex = {
            name: `ix_${map.production.finishingPrinting.collection.MonitoringEvent}_code`,
            key: {
                code: 1
            },
            unique: true
        };

        return this.collection.createIndexes([dateIndex, codeIndex]);
    }
}
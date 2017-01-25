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
        var dateProcess = new Date(valid.date);

        var getMonitoringEventPromise = this.collection.singleOrDefault({
            _id: {
                '$ne': new ObjectId(valid._id)
            },
            code: valid.code
        });

        valid.items = valid.items instanceof Array ? valid.items : [];
        var getMonitoringEventTypes = valid.items.map((item) => {
            return ObjectId.isValid(item.monitoringEventTypeId) ? this.monitoringEventTypeManager.getSingleByIdOrDefault(new ObjectId(item.monitoringEventTypeId)) : Promise.resolve(null);
        });

        return Promise.all([getMonitoringEventPromise].concat(getMonitoringEventTypes))
            .then(results =>{
                var _monitoringEvent = results[0];
                var _monitoringEventTypes = results.slice(1, results.length);

                if (_monitoringEvent)
                    errors["code"] = i18n.__("MonitoringEvent.code.isExists:%s is exists", i18n.__("MonitoringEvent.code._:Code"));

                if (!valid.date || valid.date == '')
                    errors["date"] = i18n.__("MonitoringEvent.date.isRequired:%s is required", i18n.__("MonitoringEvent.date._:Date")); //"Tanggal tidak boleh kosong";
                else if (dateProcess > dateNow)
                    errors["date"] = i18n.__("MonitoringEvent.date.isGreater:%s is greater than today", i18n.__("MonitoringEvent.date._:Date"));//"Tanggal tidak boleh lebih besar dari tanggal hari ini";

                if (!valid.timeInMillis || valid.timeInMillis === 0)
                    errors["timeInMillis"] = i18n.__("MonitoringEvent.timeInMillis.isRequired:%s is required", i18n.__("MonitoringEvent.timeInMillis._:Time")); //"Time tidak boleh kosong";

                if (!valid.machine)
                    errors["machine"] = i18n.__("MonitoringEvent.machine.name.isRequired:%s is required", i18n.__("MonitoringEvent.machine.name._:Machine")); //"Nama Mesin tidak boleh kosong";

                if (!valid.productionOrder || valid.productionOrder == '')
                    errors["productionOrder"] = i18n.__("MonitoringEvent.productionOrder.isRequired:%s is required", i18n.__("MonitoringEvent.productionOrder._:Production Order Number")); //"ProductionOrder tidak boleh kosong";

                if (valid.items && valid.items.length <= 0) {
                    errors["items"] = i18n.__("MonitoringEvent.items.isRequired:%s is required", i18n.__("MonitoringEvent.items._:Monitoring Event Item")); //"Harus ada minimal 1 barang";
                }
                else {
                    var itemErrors = [];
                    var valueArr = valid.items.map(function (item) {
                        return Object.keys(item.monitoringEventTypeId).length === 0 && item.monitoringEventTypeId.constructor === Object ? '' : item.monitoringEventTypeId.toString() 
                    });
                    var isDuplicate = valueArr.some(function (item, idx) {
                        var itemError = {};
                        if (item != '' && valueArr.indexOf(item) != idx) {
                            itemError["monitoringEventType"] = i18n.__("MonitoringEvent.items.monitoringEventType.name.isDuplicate:%s is duplicate", i18n.__("MonitoringEvent.items.monitoringEventType.name._:Monitoring Event Type")); //"Nama event type sudah ada";
                        }
                        if (Object.getOwnPropertyNames(itemError).length > 0) {
                            itemErrors[valueArr.indexOf(item)] = itemError;
                            itemErrors[idx] = itemError;
                        }
                        return itemErrors.length > 0;
                    });
                    if (!isDuplicate) {
                        for (var monitoringEventItem of valid.items) {
                            var itemError = {};
                            if (!monitoringEventItem.monitoringEventType || !monitoringEventItem.monitoringEventType._id) {
                                itemError["monitoringEventType"] = i18n.__("MonitoringEvent.items.monitoringEventType.name.isRequired:%s is required", i18n.__("MonitoringEvent.items.monitoringEventType.name._:Monitoring Event Type")); //"Nama event type tidak boleh kosong";
                            }
                            if (Object.getOwnPropertyNames(itemError).length > 0) {
                                itemErrors[valid.items.indexOf(monitoringEventItem)] = itemError;
                            }
                        }
                    }
                    if (itemErrors.length > 0)
                        errors.items = itemErrors;
                }

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    var ValidationError = require("module-toolkit").ValidationError;
                    return Promise.reject(new ValidationError("data does not pass validation", errors));
                }

                if(valid.date)
                    valid.date = dateProcess;
                
                for (var monitoringEventItem of valid.items) {
                    for (var _monitoringEventType of _monitoringEventTypes) {
                        if (monitoringEventItem.monitoringEventType._id.toString() === _monitoringEventType._id.toString()) {
                            monitoringEventItem.monitoringEventTypeId = _monitoringEventType._id;
                            monitoringEventItem.monitoringEventType = _monitoringEventType;
                            break;
                        }
                    }
                }

                if(!valid.stamp)
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
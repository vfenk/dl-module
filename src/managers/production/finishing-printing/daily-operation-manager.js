"use strict";

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");
var DLModels = require("dl-models");
var map = DLModels.map;
var StepManager = require('../../master/step-manager');
var MachineManager = require('../../master/machine-manager');
var KanbanManager = require('./kanban-manager');
var DailyOperation = DLModels.production.finishingPrinting.DailyOperation;
var BaseManager = require("module-toolkit").BaseManager;
var i18n = require("dl-i18n");
var codeGenerator = require('../../../utils/code-generator');
var moment = require('moment');

module.exports = class DailyOperationManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.production.finishingPrinting.collection.DailyOperation);
        this.stepManager = new StepManager(db, user);
        this.machineManager = new MachineManager(db, user);
        this.kanbanManager = new KanbanManager(db, user);
    }

    _getQuery(paging) {
        var _default = {
                _deleted: false
            },
            pagingFilter = paging.filter || {},
            keywordFilter = {},
            query = {};

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var orderNoFilter = {
                "productionOrder.orderNo": {
                    "$regex": regex
                }
            };
            var colorFilter = {
                "selectedProductionOrderDetail.color": {
                    "$regex": regex
                }
            };
            var colorTypeFilter = {
                "selectedProductionOrderDetail.colorType.name": {
                    "$regex": regex
                }
            };
            var cartFilter = {
                "cart.cartNumber": {
                    "$regex": regex
                }
            };
            var stepFilter = {
                "step.process": {
                    "$regex": regex
                }
            };
            var machineFilter = {
                "machine.name": {
                    "$regex": regex
                }
            };
            keywordFilter["$or"] = [orderNoFilter, colorFilter, colorTypeFilter, cartFilter, stepFilter, machineFilter];
        }
        query["$and"] = [_default, keywordFilter, pagingFilter];
        return query;
    }

    _beforeInsert(data) {
        data.code = !data.code || data.code === "" ? codeGenerator() : data.code;
        data._createdDate = new Date();
        return Promise.resolve(data);
    }

    _validate(dailyOperation) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = dailyOperation;
            var dateNow = new Date();
            var dateNowString = moment(dateNow).format('YYYY-MM-DD');
            var timeInMillisNow = dateNow.getTime() % 86400000;
            var dateInput = new Date(valid.dateInput);

            //1. begin: Declare promises.
            var getKanban = valid.kanbanId && ObjectId.isValid(valid.kanbanId) ? this.kanbanManager.getSingleByIdOrDefault(new ObjectId(valid.kanbanId)) : Promise.resolve(null);
            var getMachine = valid.machineId && ObjectId.isValid(valid.machineId) ? this.machineManager.getSingleByIdOrDefault(new ObjectId(valid.machineId)) : Promise.resolve(null);
            Promise.all([getKanban,getMachine])
                .then(results => {
                    var _kanban = results[0];
                    var _machine = results[1];
                    var now = new Date();
                    
                    if(!valid.kanbanId || valid.kanbanId.toString() === "")
                        errors["kanban"] = i18n.__("DailyOperation.kanban.isRequired:%s is required", i18n.__("DailyOperation.kanban._:Kanban")); //"kanban tidak ditemukan";
                    else if(!_kanban)
                        errors["kanban"] = i18n.__("DailyOperation.kanban.isRequired:%s is required", i18n.__("DailyOperation.kanban._:Kanban")); //"kanban tidak ditemukan";

                    if(!valid.machineId || valid.machineId.toString() === ""){
                        errors["machine"] = i18n.__("DailyOperation.machine.isRequired:%s not required", i18n.__("DailyOperation.machine._:Machine")); //"Machine tidak ditemukan";
                    }else if(!_machine){
                        errors["machine"] = i18n.__("DailyOperation.machine.isRequired:%s not required", i18n.__("DailyOperation.machine._:Machine")); //"Machine tidak ditemukan";
                    }

                    if (!valid.dateInput || valid.dateInput == '')
                        errors["dateInput"] = i18n.__("DailyOperation.dateInput.isRequired:%s is required", i18n.__("DailyOperation.dateStart._:Date Input")); //"Tanggal Mulai tidak boleh kosong";
                    else if (dateInput > dateNow)
                        errors["dateInput"] = i18n.__("DailyOperation.dateInput.isGreater:%s is greater than today", i18n.__("DailyOperation.dateInput._:Date Input"));//"Tanggal Mulai tidak boleh lebih besar dari tanggal hari ini";
                    else if (valid.dateStart === dateNowString && valid.timeInput > timeInMillisNow)
                        errors["timeInput"] = i18n.__("DailyOperation.timeInput.isGreater:%s is greater than today", i18n.__("DailyOperation.timeInput._:Time Input"));//"Time Mulai tidak boleh lebih besar dari time hari ini";

                    if (!valid.timeInput || valid.timeInput === 0)
                        errors["timeInput"] = i18n.__("DailyOperation.timeInput.isRequired:%s is required", i18n.__("DailyOperation.timeInput._:Time Input")); //"Time Input tidak boleh kosong";

                    if(!valid.input || valid.input == ''){
                        errors["input"] = i18n.__("DailyOperation.input.isRequired:%s is must be more than 0", i18n.__("DailyOperation.input._:Input")); //"nilai input harus lebih besar dari 0";
                    }else if(valid.input < 1){
                        errors["input"] = i18n.__("DailyOperation.input.isRequired:%s is must be more than 0", i18n.__("DailyOperation.input._:Input")); //"nilai input harus lebih besar dari 0";
                    }
                    
                    if((valid.dateOutput && valid.dateOutput !== '') || (valid.goodOutput && valid.goodOutput !== '') || (valid.badOutput && valid.badOutput !== '') || (valid.badOutputDescription && valid.badOutputDescription !== '') || valid.isOutput){
                        if(!valid.dateOutput || valid.dateOutput === '')
                            errors["dateOutput"] = i18n.__("DailyOperation.dateOutput.isRequired:%s is required", i18n.__("DailyOperation.dateOutput._:Date Output")); //"tanggal Output harus diisi";
                        else{
                            var dateOutput = new Date(valid.dateOutput);
                            if (dateOutput > dateNow)
                                errors["dateOutput"] = i18n.__("DailyOperation.dateOutput.isGreater:%s is greater than today", i18n.__("DailyOperation.dateOutput._:Date Output"));//"Tanggal Selesai tidak boleh lebih besar dari tanggal hari ini";
                            else if (valid.dateOutput === dateNowString && valid.timeOutput > timeInMillisNow)
                                errors["timeOutput"] = i18n.__("DailyOperation.timeOutput.isGreater:%s is greater than today", i18n.__("DailyOperation.timeOutput._:Time Output"));//"Time Selesai tidak boleh lebih besar dari time hari ini";
                        }

                        if (valid.dateInput && valid.dateInput != '' && valid.dateOutput && valid.dateOutput != ''){
                            if (dateInput > dateOutput){
                                var errorMessage = i18n.__("DailyOperation.dateInput.isGreaterThanDateEnd:%s is greater than Date End", i18n.__("DailyOperation.dateInput._:Date Input")); //"Tanggal Mulai tidak boleh lebih besar dari Tanggal Selesai";
                                errors["dateInput"] = errorMessage;
                                errors["dateOutput"] = errorMessage;
                            }
                        }
                        
                        if (!valid.timeOutput || valid.timeOutput === 0)
                            errors["timeOutput"] = i18n.__("DailyOperation.timeOutput.isRequired:%s is required", i18n.__("DailyOperation.timeOutput._:Time Output")); //"Time Output tidak boleh kosong";

                        if (valid.dateInput && valid.dateInput != '' && valid.dateOutput && valid.dateOutput != '' && valid.dateInput === valid.dateOutput){
                            if (valid.timeInput > valid.timeOutput){
                                var errorMessage = i18n.__("DailyOperation.timeInput.isGreaterThanTimeInMillisEnd:%s is greater than Time End", i18n.__("DailyOperation.timeInput._:Time Input")); //"Time Mulai tidak boleh lebih besar dari Time Selesai";
                                errors["timeInput"] = errorMessage;
                                errors["timeOutput"] = errorMessage;
                            }
                        }

                        if(!valid.goodOutput || valid.goodOutput === '')
                            errors["goodOutput"] = i18n.__("DailyOperation.goodOutput.isRequired:%s is required", i18n.__("DailyOperation.goodOutput._:Good Output")); //"nilai good output tidak boleh kosong";
                        else if(valid.input && valid.input != '' && valid.goodOutput && valid.goodOutput != ''){
                            if(valid.goodOutput > valid.input){
                                errors["goodOutput"] = i18n.__("DailyOperation.goodOutput.isNotBeMore:%s should not be more than input value", i18n.__("DailyOperation.goodOutput._:Good Output")); //"nilai good output tidak boleh lebih besar dari nilai input";
                            }
                        }

                        if(!valid.badOutput || valid.badOutput === '')
                            errors["badOutput"] = i18n.__("DailyOperation.badOutput.isNotBeMore:%s is required", i18n.__("DailyOperation.badOutput._:Bad Output")); //"nilai bad output tidak boleh kosong";
                        if(valid.input && valid.input != '' && valid.badOutput && valid.badOutput != ''){
                            if(valid.badOutput > valid.input){
                                errors["badOutput"] = i18n.__("DailyOperation.badOutput.isNotBeMore:%s should not be more than input value", i18n.__("DailyOperation.badOutput._:Bad Output")); //"nilai good output harus tidak boleh besar dari nilai input";
                            }
                            if(valid.goodOutput && valid.goodOutput != ''){
                                if((valid.goodOutput + valid.badOutput) > valid.input){
                                    errors["badOutput"] = i18n.__("DailyOperation.badOutput.isNotBeMore:%s plus Good Output should not be more than input value", i18n.__("DailyOperation.badOutput._:Bad Output")); //"nilai good output + bad output tidak boleh lebih besar dari nilai input";
                                    errors["goodOutput"] = i18n.__("DailyOperation.goodOutput.isNotBeMore:%s plus bad Output should not be more than input value", i18n.__("DailyOperation.goodOutput._:Good Output")); //"nilai good output + bad output tidak boleh lebih besar dari nilai input";
                                    errors["input"] = i18n.__("DailyOperation.input.isNotBeLess:%s should not be less then good output plus bad output", i18n.__("DailyOperation.kanban.partitions.input._:Input")); //"nilai input harus lebih besar dari good output + bad output";
                                }
                            }
                        } 
                    }else{
                        delete valid.goodOutput;
                        delete valid.timeOutput;
                        delete valid.badOutput;
                        delete valid.badOutputDescription;
                        delete valid.dateOutput;
                    }
                    
                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('module-toolkit').ValidationError;
                        return Promise.reject(new ValidationError('data does not pass validation', errors));
                    }

                    if(_kanban){
                        valid.kanban = _kanban;
                        valid.kanbanId = _kanban._id;
                    }
                    if(_machine){
                        valid.machine = _machine;
                        valid.machineId = _machine._id;
                    }

                    if(valid.dateInput)
                        valid.dateInput = dateInput;
                    if(valid.dateOutput)
                        valid.dateOutput = new Date(valid.dateOutput);

                    if (!valid.stamp)
                        valid = new DailyOperation(valid);
                    valid.stamp(this.user.username, "manager");
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                });
            });
    }

    getDailyOperationReport(sdate, edate, machine){
        return new Promise((resolve, reject) => {
            var date = {
                "dateInput" : {
                    "$gte" : (!query || !query.sdate ? (new Date("1900-01-01")) : (new Date(`${query.sdate} 00:00:00`))),
                    "$lte" : (!query || !query.edate ? (new Date()) : (new Date(`${query.edate} 23:59:59`)))
                },
                "_deleted" : false
            };
            var machineQuery = {};
            if(machine)
            {
                machineQuery = {
                    "machineId" : new ObjectId(machine)
                }
            }
            var order = {
                "dateInput" : -1
            };
            var Query = {"$and" : [date, machineQuery]};

            this.collection
                .find(Query)
                .sort(order)
                .toArray(function(err, result) {
                    resolve(result);
                });
        });
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.production.finishingPrinting.collection.DailyOperation}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        return this.collection.createIndexes([dateIndex]);
    }
};
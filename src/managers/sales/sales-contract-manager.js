'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var SalesContract=DLModels.sales.SalesContract;
var SalesContractDetail=DLModels.sales.SalesContractDetail;
var ProductionOrder=DLModels.sales.ProductionOrder;
var ProductionOrderDetail=DLModels.sales.ProductionOrderDetail;
var BuyerManager=require('../master/buyer-manager');
var UomManager = require('../master/uom-manager');
var ProductManager = require('../master/product-manager');
var CurrencyManager = require('../master/currency-manager');
var ProcessTypeManager = require('../master/process-type-manager');
var OrderTypeManager = require('../master/order-type-manager');
var ColorTypeManager = require('../master/color-type-manager');
var InstructionManager = require('../master/instruction-manager');
var BaseManager = require('module-toolkit').BaseManager;
var i18n = require('dl-i18n');
var generateCode = require("../../utils/code-generator");
var assert = require('assert');

module.exports = class SalesContractManager extends BaseManager {
    constructor(db, user) {
        super(db, user);

        this.collection = this.db.collection(map.sales.collection.SalesContract);
        this.BuyerManager= new BuyerManager(db,user);
        this.UomManager = new UomManager(db, user);
        this.ProductManager = new ProductManager(db, user);
        this.InstructionManager = new InstructionManager(db, user);
        this.ProcessTypeManager = new ProcessTypeManager(db, user);
        this.ColorTypeManager = new ColorTypeManager(db, user);
        this.OrderTypeManager = new OrderTypeManager(db, user);
        this.CurrencyManager = new CurrencyManager(db,user);
    }

    _getQuery(paging) {
        var deletedFilter = {
            _deleted: false
        }, keywordFilter = {};

        var query = {};
        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");

            var filterSalesContract = {
                'salesContractNo': {
                    '$regex': regex
                }
            };
           
           var filterBuyer = {
               'buyer.name': {
                    '$regex': regex
                }
            };

           var filterOrder = {
               'orderType.name': {
                    '$regex': regex
                }
            };

            keywordFilter = {
                '$or': [filterSalesContract, filterBuyer, filterOrder]
            };
        }
        query = { '$and': [deletedFilter, paging.filter, keywordFilter] }
        return query;
    }


    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.sales.collection.SalesContract}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        }

        var noIndex = {
            name: `ix_${map.sales.collection.SalesContract}_no`,
            key: {
                salesContractNo: 1
            },
            unique: true
        }

        return this.collection.createIndexes([dateIndex, noIndex]);
    }

    _beforeInsert(salesContract) {
        salesContract.salesContractNo = generateCode();
        return Promise.resolve(purchaseRequest);
    }

    _validate(salesContract) {
        var errors = {};
        var valid = salesContract;

        var getSalesContractPromise = this.collection.singleOrDefault({
            _id: {
                '$ne': new ObjectId(valid._id)
            },
            salesContractNo: valid.salesContractNo
        });

        var getBuyer = ObjectId.isValid(valid.buyerId) ? this.BuyerManager.getSingleByIdOrDefault(valid.buyerId) : Promise.resolve(null);
        var getUom = valid.uom && ObjectId.isValid(valid.uomId) ? this.UomManager.getSingleByIdOrDefault(valid.uomId) : Promise.resolve(null);
        var getProduct = ObjectId.isValid(valid.materialId) ? this.ProductManager.getSingleByIdOrDefault(valid.materialId) : Promise.resolve(null);
        var getProcessType = ObjectId.isValid(valid.processTypeId) ? this.ProcessTypeManager.getSingleByIdOrDefault(valid.processTypeId) : Promise.resolve(null);
        var getOrderType = ObjectId.isValid(valid.orderTypeId) ? this.OrderTypeManager.getSingleByIdOrDefault(valid.orderTypeId) : Promise.resolve(null);
        var getCurrency= ObjectId.isValid(valid.cuttencyId) ? this.CurrencyManager.getSingleByIdOrDefault(valid.cuttencyId) : Promise.resolve(null);

        valid.details = valid.details || [];
        var getColorTypes = [];
        for (var detail of valid.details) {
            if (ObjectId.isValid(detail.colorTypeId)) {
                var color=ObjectId.isValid(detail.colorTypeId) ? this.ColorTypeManager.getSingleByIdOrDefault(detail.colorTypeId) : Promise.resolve(null);
                getColorTypes.push(color);
            }
        }

        return Promise.all([getSalesContractPromise, getBuyer, getCurrency, getUom,  getProduct, getProcessType, getOrderType].concat(getColorTypes))
            .then(results => {
                var _salesContract = results[0];
                var _buyer = results[1];
                var _currency = results[2];
                var _uom = results[3];
                var _material = results[4];
                var _process = results[5];
                var _order = results[6];
                var _colors = results.slice(7, results.length);

                if (valid.uom) {
                    if (!valid.uom.unit || valid.uom.unit == '')
                        errors["uom"] = i18n.__("SalesContract.uom.isRequired:%s is required", i18n.__("SalesContract.uom._:Uom")); //"Satuan tidak boleh kosong";
                }
                else
                    errors["uom"] = i18n.__("SalesContract.uom.isRequired:%s is required", i18n.__("SalesContract.uom._:Uom")); //"Satuan tidak boleh kosong";

                if(!valid.salesContractNo || valid.salesContractNo===''){
                    errors["salesContractNo"]=i18n.__("SalesContract.salesContractNo.isRequired:%s is required", i18n.__("SalesContract.salesContractNo._:SalesContractNo")); //"salesContractNo tidak boleh kosong";
                }

                if(!valid.construction || valid.construction===''){
                    errors["construction"]=i18n.__("SalesContract.construction.isRequired:%s is required", i18n.__("SalesContract.construction._:Construction")); //"construction tidak boleh kosong";
                }

                if(!valid.paymentMethod || valid.paymentMethod===''){
                    errors["paymentMethod"]=i18n.__("SalesContract.paymentMethod.isRequired:%s is required", i18n.__("SalesContract.paymentMethod._:PaymentMethod")); //"paymentMethod tidak boleh kosong";
                }

                if(!valid.paymentRequirement || valid.paymentRequirement===''){
                    errors["paymentRequirement"]=i18n.__("SalesContract.paymentRequirement.isRequired:%s is required", i18n.__("SalesContract.paymentRequirement._:PaymentRequirement")); //"paymentRequirement tidak boleh kosong";
                }

                if(!valid.quality || valid.quality===''){
                    errors["quality"]=i18n.__("SalesContract.quality.isRequired:%s is required", i18n.__("SalesContract.quality._:Quality")); //"quality tidak boleh kosong";
                }

                if (!_material)
                    errors["material"] = i18n.__("SalesContract.material.isRequired:%s is not exists", i18n.__("SalesContract.material._:Material")); //"material tidak boleh kosong";
                else if (!valid.materialId)
                    errors["material"] = i18n.__("SalesContract.material.isRequired:%s is required", i18n.__("SalesContract.material._:Material")); //"material tidak boleh kosong";

                if (!_process)
                    errors["processType"] = i18n.__("SalesContract.processType.isRequired:%s is not exists", i18n.__("SalesContract.processType._:ProcessType")); //"processType tidak boleh kosong";
                else if (!valid.processTypeId)
                    errors["processType"] = i18n.__("SalesContract.processType.isRequired:%s is required", i18n.__("SalesContract.processType._:ProcessType")); //"processType tidak boleh kosong";
                
                if (!_order)
                    errors["orderType"] = i18n.__("SalesContract.orderType.isRequired:%s is not exists", i18n.__("SalesContract.orderType._:OrderType")); //"orderType tidak boleh kosong";
                else if (!valid.processTypeId)
                    errors["orderType"] = i18n.__("SalesContract.orderType.isRequired:%s is required", i18n.__("SalesContract.orderType._:OrderType")); //"orderType tidak boleh kosong";
                
                if(!valid.rollLength || valid.rollLength===''){
                    errors["rollLength"]=i18n.__("SalesContract.rollLength.isRequired:%s is required", i18n.__("SalesContract.rollLength._:RollLength")); //"rollLength tidak boleh kosong";
                }

                if(!valid.condition || valid.condition===''){
                    errors["condition"]=i18n.__("SalesContract.condition.isRequired:%s is required", i18n.__("SalesContract.condition._:RollLength")); //"condition tidak boleh kosong";
                }

                if (!_buyer)
                    errors["buyer"] = i18n.__("SalesContract.buyer.isRequired:%s is not exists", i18n.__("SalesContract.buyer._:Buyer")); //"Buyer tidak boleh kosong";
                else if (!valid.buyerId)
                    errors["buyer"] = i18n.__("SalesContract.buyer.isRequired:%s is required", i18n.__("SalesContract.buyer._:Buyer")); //"Buyer tidak boleh kosong";
                
                if (!_currency)
                    errors["currency"] = i18n.__("SalesContract.currency.isRequired:%s is not exists", i18n.__("SalesContract.currency._:Currency")); //"currency tidak boleh kosong";
                else if (!valid.currencyId)
                    errors["currency"] = i18n.__("SalesContract.currency.isRequired:%s is required", i18n.__("SalesContract.currency._:Currency")); //"currency tidak boleh kosong";

                if (!valid.spelling || valid.spelling === 0)
                    errors["spelling"] = i18n.__("SalesContract.spelling.isRequired:%s is required", i18n.__("SalesContract.spelling._:Spelling")); //"spelling tidak boleh kosong";
                
                valid.details = valid.details || [];
                if (valid.details && valid.details.length <= 0) {
                    errors["details"] = i18n.__("SalesContract.details.isRequired:%s is required", i18n.__("SalesContract.details._:Details")); //"Harus ada minimal 1 detail";
                }
                else if(valid.details.length>0) {
                    var detailErrors = [];
                    var totalqty=0;
                    for(var i of valid.details){
                        totalqty+=i.quantity;
                    }
                    for (var detail of valid.details) {
                        var detailError = {};
                        detail.code=generateCode();
                        if (!detail.color || detail.color=="")
                            detailError["color"] = i18n.__("SalesContract.details.color.isRequired:%s is required", i18n.__("PurchaseRequest.details.color._:Color")); //"color tidak boleh kosong";
                        if (!_currency)
                            errors["currency"] = i18n.__("SalesContract.currency.isRequired:%s is not exists", i18n.__("SalesContract.currency._:Currency")); //"currency tidak boleh kosong";
                        else if (!valid.currencyId)
                            errors["currency"] = i18n.__("SalesContract.currency.isRequired:%s is required", i18n.__("SalesContract.currency._:Currency")); //"currency tidak boleh kosong";
                        
                        if (!detail.price || detail.price=="")
                            detailError["price"] = i18n.__("SalesContract.details.price.isRequired:%s is required", i18n.__("PurchaseRequest.details.price._:Price")); //"price tidak boleh kosong";
                        

                        if(_currency){
                            detail.currencyId=new ObjectId(_currency._id);
                        }
                        
                        if(_order){
                            if(_order.name.trim().toLowerCase()=="yarndyed" || _order.name.trim().toLowerCase()=="printing" ){
                                _colors={};
                            }
                            else{
                                if (!_colors)
                                    detailError["colorType"] = i18n.__("SalesContract.details.colorType.isRequired:%s is required", i18n.__("PurchaseRequest.details.colorType._:ColorType")); //"colorType tidak boleh kosong";
                            }
                        }
                        
                        if (Object.getOwnPropertyNames(detailError).length > 0)
                            detailErrors.push(detailError);
                    }
                    if (detailErrors.length > 0)
                        errors.details = detailErrors;
                    
                }

                if(_buyer){
                    valid.buyerId=new ObjectId(_buyer._id);
                }
                if(_currency){
                    valid.currencyId=new ObjectId(_currency._id);
                }
                if(_uom){
                    valid.uomId=new ObjectId(_uom._id);
                }
                if(_process){
                    valid.processTypeId=new ObjectId(_process._id);
                }
                if(_order){
                    valid.orderTypeId=new ObjectId(_order._id);

                    if(_order.name.trim().toLowerCase()=="yarndyed" || _order.name.trim().toLowerCase()=="printing" ){
                        for (var detail of valid.details) {
                            detail.colorTypeId = null;
                            detail.colorType = null;
                        }
                    }
                    else{
                        for (var detail of valid.details) {
                            for (var _color of _colors) {
                                if (detail.colorTypeId.toString() === _color._id.toString()) {
                                    detail.colorTypeId = _color._id;
                                    detail.colorType = _color;
                                    break;
                                }
                            }
                        }
                    }
                }
                if(_material){
                    valid.material=_material;
                    valid.materialId=new ObjectId(_material._id);
                }
                
                valid.deliveryDate=new Date(valid.deliveryDate);

                if (Object.getOwnPropertyNames(errors).length > 0) {
                    var ValidationError = require('module-toolkit').ValidationError;
                    return Promise.reject(new ValidationError('data does not pass validation', errors));
                }

                if (!valid.stamp){
                    valid = new ProductionOrder(valid);
                }

                valid.stamp(this.user.username, "manager");
                
                return Promise.resolve(valid);
            });
    }
}
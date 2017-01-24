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
            })
    }
}
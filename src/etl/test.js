'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var BaseManager = require("module-toolkit").BaseManager;
var moment = require("moment");

// internal deps 
require("mongodb-toolkit");

var PurchaseRequestManager = require("../managers/purchasing/purchase-request-manager");
var PurchaseOrderManager = require('../managers/purchasing/purchase-order-manager');

module.exports = class FactPurchasingEtlManager extends BaseManager {
    constructor(db, user, sql) {
        super(db, user);
        this.sql = sql;
        this.purchaseRequestManager = new PurchaseRequestManager(db, user);
        this.purchaseOrderManager = new PurchaseOrderManager(db, user);
        this.migrationLog = this.db.collection("migration-log");
    }

    run() {
        var startedDate = new Date();
        this.migrationLog.insert({
            description: "Fact Pembelian from MongoDB to Azure DWH",
            start: startedDate,
        })
        return this.extract()
            .then((data) => this.transform(data))
            .then((data) => this.load(data))
            .then((results) => {
                var finishedDate = new Date();
                var spentTime = moment(finishedDate).diff(moment(startedDate), "minutes");
                var updateLog = {
                    description: "Fact Pembelian from MongoDB to Azure DWH",
                    start: startedDate,
                    finish: finishedDate,
                    executionTime: spentTime + " minutes",
                    status: "Successful"
                };
                this.migrationLog.updateOne({ start: startedDate }, updateLog);
            })
            .catch((err) => {
                var finishedDate = new Date();
                var spentTime = moment(finishedDate).diff(moment(startedDate), "minutes");
                var updateLog = {
                    description: "Fact Pembelian from MongoDB to Azure DWH",
                    start: startedDate,
                    finish: finishedDate,
                    executionTime: spentTime + " minutes",
                    status: err
                };
                this.migrationLog.updateOne({ start: startedDate }, updateLog);
            });
    }

    timestamp() {
        return this.migrationLog.find({
            description: "Fact Pembelian from MongoDB to Azure DWH",
            status: "Successful"
        }).sort({ finish: -1 }).limit(1).toArray()
    }

    extractPR(time) {
        var timestamp = new Date(time[0].finish);
        return this.purchaseRequestManager.collection.find({
            _deleted: false,
            _createdBy: {
                "$nin": ["dev", "unit-test"]
            },
            _updatedDate: {
                "$gt": timestamp
            }
        }).limit(10).toArray()
    }

    extractPO(time) {
        var timestamp = new Date(time[0].finish);
        return this.purchaseOrderManager.collection.find({
            _deleted: false,
            _createdBy: {
                "$nin": ["dev", "unit-test"]
            },
            _updatedDate: {
                "$gt": timestamp
            }
        }).limit(10).toArray()
    }

    getPRFromPO(datas) {
        var joinExtractedPR = datas.map((data) => {
            return data.purchaseRequest;
        })
        return Promise.all(joinExtractedPR)
    }

    extractPRFromPO() {
        return this.timestamp()
            .then((time) => this.extractPO(time))
            .then((datas) => this.getPRFromPO(datas))
    }

    extractPRfromPR() {
        return this.timestamp()
            .then((time) => this.extractPR(time))
    }

    joinPurchaseOrder(purchaseRequests) {
        var joinPurchaseOrders = purchaseRequests.map((purchaseRequest) => {
            return this.purchaseOrderManager.collection.find({
                _deleted: false,
                _createdBy: {
                    $nin: ["dev", "unit-test"]
                },
                purchaseRequestId: purchaseRequest._id
            })
                .toArray()
                .then((purchaseOrders) => {
                    var arr = purchaseOrders.map((purchaseOrder) => {
                        return {
                            purchaseRequest: purchaseRequest,
                            purchaseOrder: purchaseOrder
                        };
                    });

                    if (arr.length == 0)
                        arr.push({
                            purchaseRequest: purchaseRequest,
                            purchaseOrder: null
                        });
                    return Promise.resolve(arr);
                });
        });
        return Promise.all(joinPurchaseOrders)
            .then((joinPurchaseOrder => {
                return Promise.resolve([].concat.apply([], joinPurchaseOrder));
            }));
    }

    collectPR() {
        var purchaseRequest = this.extractPRfromPR();
        var prFromPOInternal = this.extractPRFromPO();
        return Promise.all([purchaseRequest, prFromPOInternal])
            .then((data) => {
                var purchaseRequest = data[0];
                var prFromPOInternal = data[1];
                return Promise.resolve(purchaseRequest.concat(prFromPOInternal))
            })
    }

    extract() {
        return this.collectPR()
            .then((data) => this.removeDuplicates(data))
            .then((purchaseRequest) => this.joinPurchaseOrder(purchaseRequest));
    }

    removeDuplicates(arr) {
        var new_arr = [];
        var lookup = {};

        for (var i in arr) {
            lookup[arr[i].no] = arr[i];
        }

        for (i in lookup) {
            new_arr.push(lookup[i]);
        }

        return Promise.resolve(new_arr);
    }

    getRangeMonth(days) {
        if (days <= 30) {
            return "0-30 hari";
        } else if (days >= 31 && days <= 60) {
            return "31-60 hari";
        } else if (days >= 61 && days <= 90) {
            return "61-90 hari";
        } else if (days > 90) {
            return ">90 hari";
        }
    };

    getRangeWeek(days) {
        if (days <= 7) {
            return "0-7 hari";
        } else if (days >= 8 && days <= 14) {
            return "8-14 hari";
        } else if (days >= 15 && days <= 30) {
            return "15-30 hari";
        } else if (days > 30) {
            return ">30 hari";
        }
    };

    getCategoryType(catType) {
        if (catType === "BAHAN BAKU") {
            return "BAHAN BAKU";
        } else {
            return "NON BAHAN BAKU";
        }
    }

    getStatus(poDate, doDate) {
        var poDates = moment(poDate).startOf("day");
        var doDates = moment(doDate).startOf("day");
        var result = moment(doDates).diff(moment(poDates), "days")
        if (result <= 0) {
            return "Tepat Waktu";
        } else {
            return "Tidak Tepat Waktu";
        }
    }

    transform(data) {
        var result = data.map((item) => {
            var purchaseRequest = item.purchaseRequest;
            var purchaseOrder = item.purchaseOrder;

            if (item.purchaseOrder) {

                var results = purchaseOrder.items.map((poItem) => {
                    var catType = purchaseOrder.purchaseRequest.category.name;

                    if (poItem.fulfillments.length > 0) {

                        return poItem.fulfillments.map((poFulfillment) => {
                            var prPoExtDays = purchaseOrder.purchaseOrderExternal ? moment(moment(purchaseOrder.purchaseOrderExternal.date).startOf("day")).diff(moment(moment(purchaseRequest.date).startOf("day")), "days") : null;
                            var poIntDays = purchaseOrder ? moment(moment(purchaseOrder._createdDate).startOf("day")).diff(moment(moment(purchaseRequest.date).startOf("day")), "days") : null;
                            var poExtDays = purchaseOrder.purchaseOrderExternal ? moment(moment(purchaseOrder.purchaseOrderExternal.date).startOf("day")).diff(moment(moment(purchaseOrder._createdDate).startOf("day")), "days") : null;
                            var doDays = poFulfillment.deliveryOrderDate ? moment(moment(poFulfillment.deliveryOrderDate).startOf("day")).diff(moment(moment(purchaseOrder.purchaseOrderExternal.date).startOf("day")), "days") : null;
                            var urnDays = poFulfillment.unitReceiptNoteDate ? moment(moment(poFulfillment.unitReceiptNoteDate).startOf("day")).diff(moment(moment(poFulfillment.deliveryOrderDate).startOf("day")), "days") : null;
                            var upoDays = poFulfillment.interNoteDate ? moment(moment(poFulfillment.interNoteDate).startOf("day")).diff(moment(moment(poFulfillment.unitReceiptNoteDate).startOf("day")), "days") : null;
                            var poDays = unitPaymentOrder ? moment(moment(unitPaymentOrder.date).startOf("day")).diff(moment(moment(purchaseOrder._createdDate).startOf("day")), "days") : null;
                            var lastDeliveredDate = (poItem.fulfillments.length > 0) ? poItem.fulfillments[poItem.fulfillments.length - 1].deliveryOrderDate : null;
                            return {
                                purchaseRequestId: purchaseRequest ? `'${purchaseOrder.purchaseRequest._id}'` : null,
                                purchaseRequestNo: purchaseRequest ? `'${purchaseOrder.purchaseRequest.no}'` : null,
                                purchaseRequestDate: purchaseRequest ? `'${moment(purchaseOrder.purchaseRequest.date).format('L')}'` : null,
                                expectedPRDeliveryDate: purchaseRequest ? `'${moment(purchaseOrder.purchaseRequest.expectedDeliveryDate).format('L')}'` : null,
                                budgetCode: purchaseRequest ? `'${purchaseOrder.purchaseRequest.budget.code}'` : null,
                                budgetName: purchaseRequest ? `'${purchaseOrder.purchaseRequest.budget.name}'` : null,
                                unitCode: purchaseRequest ? `'${purchaseOrder.purchaseRequest.unit.code}'` : null,
                                unitName: purchaseRequest ? `'${purchaseOrder.purchaseRequest.unit.name}'` : null,
                                divisionCode: purchaseRequest ? `'${purchaseOrder.purchaseRequest.unit.division.code}'` : null,
                                divisionName: purchaseRequest ? `'${purchaseOrder.purchaseRequest.unit.division.name}'` : null,
                                categoryCode: purchaseRequest ? `'${purchaseOrder.purchaseRequest.category.code}'` : null,
                                categoryName: purchaseRequest ? `'${purchaseOrder.purchaseRequest.category.name}'` : null,
                                categoryType: purchaseRequest ? `'${this.getCategoryType(catType)}'` : null,
                                productCode: purchaseRequest ? `'${poItem.product.code}'` : null,
                                productName: purchaseRequest ? `'${poItem.product.name.replace(/'/g, '"')}'` : null,
                                purchaseRequestDays: purchaseRequest ? `${poIntDays}` : null,
                                purchaseRequestDaysRange: purchaseRequest ? `'${this.getRangeWeek(poIntDays)}'` : null,
                                prPurchaseOrderExternalDays: purchaseOrder.purchaseOrderExternal ? `${prPoExtDays}` : null,
                                prPurchaseOrderExternalDaysRange: purchaseOrder.purchaseOrderExternal ? `'${this.getRangeWeek(prPoExtDays)}'` : null,

                                purchaseOrderId: purchaseOrder ? `'${purchaseOrder._id}'` : null,
                                purchaseOrderNo: purchaseOrder ? `'${purchaseOrder.no}'` : null,
                                purchaseOrderDate: purchaseOrder ? `'${moment(purchaseOrder._createdDate).format('L')}'` : null,
                                purchaseOrderExternalDays: purchaseOrderExternal ? `${poExtDays}` : null,
                                purchaseOrderExternalDaysRange: purchaseOrderExternal ? `'${this.getRangeWeek(poExtDays)}'` : null,
                                purchasingStaffName: purchaseOrder ? `'${purchaseOrder._createdBy}'` : null,
                                prNoAtPo: purchaseOrder ? `'${purchaseOrder.purchaseRequest.no}'` : null,

                                purchaseOrderExternalId: purchaseOrderExternal ? `'${purchaseOrderExternal._id}'` : null,
                                purchaseOrderExternalNo: purchaseOrderExternal ? `'${purchaseOrderExternal.no}'` : null,
                                purchaseOrderExternalDate: purchaseOrderExternal ? `'${moment(purchaseOrderExternal.date).format('L')}'` : null,
                                deliveryOrderDays: (poItem.fulfillments.length > 0 && deliveryOrder) ? `${doDays}` : null,
                                deliveryOrderDaysRange: (poItem.fulfillments.length > 0 && deliveryOrder) ? `'${this.getRangeMonth(doDays)}'` : null,
                                supplierCode: purchaseOrderExternal ? `'${purchaseOrderExternal.supplier.code}'` : null,
                                supplierName: purchaseOrderExternal ? `'${purchaseOrderExternal.supplier.name.replace(/'/g, '"')}'` : null,
                                currencyCode: purchaseOrderExternal ? `'${purchaseOrderExternal.currency.code}'` : null,
                                currencyName: purchaseOrderExternal ? `'${purchaseOrderExternal.currency.description}'` : null,
                                paymentMethod: purchaseOrderExternal ? `'${purchaseOrderExternal.paymentMethod}'` : null,
                                currencyRate: purchaseOrderExternal ? `${purchaseOrderExternal.currencyRate}` : null,
                                purchaseQuantity: purchaseOrderExternal ? `${poItem.dealQuantity}` : null,
                                uom: purchaseOrderExternal ? `'${poItem.dealUom.unit}'` : null,
                                pricePerUnit: purchaseOrderExternal ? `${poItem.pricePerDealUnit}` : null,
                                totalPrice: purchaseOrderExternal ? `${poItem.dealQuantity * poItem.pricePerDealUnit * purchaseOrderExternal.currencyRate}` : null,
                                expectedDeliveryDate: purchaseOrderExternal ? `'${moment(purchaseOrderExternal.expectedDeliveryDate).format('L')}'` : null,
                                prNoAtPoExt: purchaseOrderExternal ? `'${purchaseOrder.purchaseRequest.no}'` : null,

                                deliveryOrderId: (poItem.fulfillments.length > 0 && deliveryOrder) ? `'${deliveryOrder._id}'` : null,
                                deliveryOrderNo: (poItem.fulfillments.length > 0 && deliveryOrder) ? `'${deliveryOrder.no}'` : null,
                                deliveryOrderDate: (poItem.fulfillments.length > 0 && deliveryOrder) ? `'${moment(deliveryOrder.date).format('L')}'` : null,
                                unitReceiptNoteDays: unitReceiptNote ? `${urnDays}` : null,
                                unitReceiptNoteDaysRange: unitReceiptNote ? `'${this.getRangeWeek(urnDays)}'` : null,
                                status: (poItem.fulfillments.length > 0 && deliveryOrder) ? `'${this.getStatus(purchaseOrderExternal.expectedDeliveryDate, lastDeliveredDate)}'` : null,
                                prNoAtDo: (poItem.fulfillments.length > 0 && deliveryOrder) ? `'${purchaseOrder.purchaseRequest.no}'` : null,

                                unitReceiptNoteId: unitReceiptNote ? `'${unitReceiptNote._id}'` : null,
                                unitReceiptNoteNo: unitReceiptNote ? `'${unitReceiptNote.no}'` : null,
                                unitReceiptNoteDate: unitReceiptNote ? `'${moment(unitReceiptNote.date).format('L')}'` : null,
                                unitPaymentOrderDays: unitPaymentOrder ? `${upoDays}` : null,
                                unitPaymentOrderDaysRange: unitPaymentOrder ? `'${this.getRangeWeek(upoDays)}'` : null,

                                unitPaymentOrderId: unitPaymentOrder ? `'${unitPaymentOrder._id}'` : null,
                                unitPaymentOrderNo: unitPaymentOrder ? `'${unitPaymentOrder.no}'` : null,
                                unitPaymentOrderDate: unitPaymentOrder ? `'${moment(unitPaymentOrder.date).format('L')}'` : null,
                                purchaseOrderDays: unitPaymentOrder ? `${poDays}` : null,
                                purchaseOrderDaysRange: unitPaymentOrder ? `'${this.getRangeMonth(poDays)}'` : null,
                                invoicePrice: unitPaymentOrder ? `'${poItem.pricePerDealUnit}'` : null
                            };
                        });
                    }
                });
                return [].concat.apply([], results);
            }
            else if (item.purchaseRequest) {
                var results = purchaseRequest.items.map((poItem) => {
                    var catType = purchaseRequest.category.name;

                    return {
                        purchaseRequestId: purchaseRequest ? `'${purchaseRequest._id}'` : null,
                        // purchaseRequestNo: purchaseRequest ? `'${purchaseRequest.no}'` : null,
                        // purchaseRequestDate: purchaseRequest ? `'${moment(purchaseRequest.date).format('L')}'` : null,
                        // expectedPRDeliveryDate: purchaseRequest ? `'${moment(purchaseRequest.expectedDeliveryDate).format('L')}'` : null,
                        // budgetCode: purchaseRequest ? `'${purchaseRequest.budget.code}'` : null,
                        // budgetName: purchaseRequest ? `'${purchaseRequest.budget.name}'` : null,
                        // unitCode: purchaseRequest ? `'${purchaseRequest.unit.code}'` : null,
                        // unitName: purchaseRequest ? `'${purchaseRequest.unit.name}'` : null,
                        // divisionCode: purchaseRequest ? `'${purchaseRequest.unit.division.code}'` : null,
                        // divisionName: purchaseRequest ? `'${purchaseRequest.unit.division.name}'` : null,
                        // categoryCode: purchaseRequest ? `'${purchaseRequest.category.code}'` : null,
                        // categoryName: purchaseRequest ? `'${purchaseRequest.category.name}'` : null,
                        // categoryType: purchaseRequest ? `'${this.getCategoryType(catType)}'` : null,
                        // productCode: purchaseRequest ? `'${poItem.product.code}'` : null,
                        // productName: purchaseRequest ? `'${poItem.product.name.replace(/'/g, '"')}'` : null,
                        // purchaseRequestDays: null,
                        // purchaseRequestDaysRange: null,
                        // prPurchaseOrderExternalDays: null,
                        // prPurchaseOrderExternalDaysRange: null,

                        // purchaseOrderId: null,
                        // purchaseOrderNo: null,
                        // purchaseOrderDate: null,
                        // purchaseOrderExternalDays: null,
                        // purchaseOrderExternalDaysRange: null,
                        // purchasingStaffName: null,
                        // prNoAtPo: null,

                        // purchaseOrderExternalId: null,
                        // purchaseOrderExternalNo: null,
                        // purchaseOrderExternalDate: null,
                        // deliveryOrderDays: null,
                        // deliveryOrderDaysRange: null,
                        // supplierCode: null,
                        // supplierName: null,
                        // currencyCode: null,
                        // currencyName: null,
                        // paymentMethod: null,
                        // currencyRate: null,
                        // purchaseQuantity: null,
                        // uom: null,
                        // pricePerUnit: null,
                        // totalPrice: null,
                        // expectedDeliveryDate: null,
                        // prNoAtPoExt: null,

                        // deliveryOrderId: null,
                        // deliveryOrderNo: null,
                        // deliveryOrderDate: null,
                        // unitReceiptNoteDays: null,
                        // unitReceiptNoteDaysRange: null,
                        // status: null,
                        // prNoAtDo: null,

                        // unitReceiptNoteId: null,
                        // unitReceiptNoteNo: null,
                        // unitReceiptNoteDate: null,
                        // unitPaymentOrderDays: null,
                        // unitPaymentOrderDaysRange: null,

                        // unitPaymentOrderId: null,
                        // unitPaymentOrderNo: null,
                        // unitPaymentOrderDate: null,
                        // purchaseOrderDays: null,
                        // purchaseOrderDaysRange: null,
                        // invoicePrice: null
                    };
                });
                return [].concat.apply([], results);
            }
        });
        return Promise.resolve([].concat.apply([], result));
    }

    insertQuery(sql, query) {
        return new Promise((resolve, reject) => {
            sql.query(query, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    load(data) {
        return data;
    }
}
'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var BaseManager = require('module-toolkit').BaseManager;
var moment = require("moment");
var sqlConnect = require("./sqlConnect");

// internal deps 
require('mongodb-toolkit');

var SupplierManager = require('../managers/master/supplier-manager');
var CategoryManager = require("../managers/master/category-manager");
var DivisionManager = require("../managers/master/division-manager");
var UnitManager = require("../managers/master/unit-manager");
var PurchaseOrderExternalManager = require('../managers/purchasing/purchase-order-external-manager');
var DeliveryOrderManager = require('../managers/purchasing/delivery-order-manager');
var UnitReceiptNoteManager = require('../managers/purchasing/unit-receipt-note-manager');

module.exports = class FactTimelinessSupplierEtlManager {
    constructor(db, user) {
        this.supplierManager = new SupplierManager(db, user);
        this.categoryManager = new CategoryManager(db, user);
        this.divisionManager = new DivisionManager(db, user);
        this.unitManager = new UnitManager(db, user);
        this.purchaseOrderExternalManager = new PurchaseOrderExternalManager(db, user);
        this.deliveryOrderManager = new DeliveryOrderManager(db, user);
        this.unitReceiptNoteManager = new UnitReceiptNoteManager(db, user);
    }

    run() {
        return this.extract()
            .then((data) => this.transform(data))
            .then((data) => this.load(data));
    }
    
    joinPurchaseOrder(purchaseRequests) {
        var joinPurchaseOrders = purchaseRequests.map((purchaseRequest) => {
            return this.purchaseOrderManager.collection.find({
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

    joinPurchaseOrderExternal(data) {
        var joinPurchaseOrderExternals = data.map((item) => {
            var getPurchaseOrderExternal = item.purchaseOrder ? this.purchaseOrderExternalManager.collection.find({
                items: {
                    "$elemMatch": {
                        _id: item.purchaseOrder._id
                    }
                }
            }).toArray() : Promise.resolve([]);

            return getPurchaseOrderExternal.then((purchaseOrderExternals) => {
                var arr = purchaseOrderExternals.map((purchaseOrderExternal) => {
                    var obj = Object.assign({}, item);
                    obj.purchaseOrderExternal = purchaseOrderExternal;
                    return obj;
                });

                if (arr.length == 0) {
                    arr.push(Object.assign({}, item, {
                        purchaseOrderExternal: null
                    }));
                }
                return Promise.resolve(arr);
            });
        });

        return Promise.all(joinPurchaseOrderExternals)
            .then(((joinPurchaseOrderExternal) => {
                return Promise.resolve([].concat.apply([], joinPurchaseOrderExternal));
            }));
    }

    joinDeliveryOrder(data) {
        var joinDeliveryOrders = data.map((item) => {
            var getDeliveryOrders = item.purchaseOrderExternal ? this.deliveryOrderManager.collection.find({
                items: {
                    "$elemMatch": {
                        purchaseOrderExternalId: item.purchaseOrderExternal._id
                    }
                }
            }).toArray() : Promise.resolve([]);

            return getDeliveryOrders.then((deliveryOrders) => {

                var arr = deliveryOrders.map((deliveryOrder) => {
                    var obj = Object.assign({}, item);
                    obj.deliveryOrder = deliveryOrder;
                    return obj;
                });
                if (arr.length == 0) {
                    arr.push(Object.assign({}, item, {
                        deliveryOrder: null
                    }));
                }
                return Promise.resolve(arr);
            });
        });
        return Promise.all(joinDeliveryOrders)
            .then((joinDeliveryOrder => {
                return Promise.resolve([].concat.apply([], joinDeliveryOrder));
            }));
    }

    joinUnitReceiptNote(data) {
        var joinUnitReceiptNotes = data.map((item) => {
            var getUnitReceiptNotes = item.deliveryOrder ? this.unitReceiptNoteManager.collection.find({
                deliveryOrderId: item.deliveryOrder._id
            }).toArray() : Promise.resolve([]);

            return getUnitReceiptNotes.then((unitReceiptNotes) => {


                var arr = unitReceiptNotes.map((unitReceiptNote) => {
                    var obj = Object.assign({}, item);
                    obj.unitReceiptNote = unitReceiptNote;
                    return obj;
                });
                if (arr.length == 0) {
                    arr.push(Object.assign({}, item, {
                        unitReceiptNote: null
                    }));
                }
                return Promise.resolve(arr);
            });
        });
        return Promise.all(joinUnitReceiptNotes)
            .then((joinUnitReceiptNote => {
                return Promise.resolve([].concat.apply([], joinUnitReceiptNote));
            }));
    }

    joinUnitPaymentOrder(data) {
        var joinUnitPaymentOrders = data.map((item) => {
            var getUnitPaymentOrders = item.unitReceiptNote ? this.unitPaymentOrderManager.collection.find({
                items: {
                    "$elemMatch": {
                        unitReceiptNoteId: item.unitReceiptNote._id
                    }
                }
            }).toArray() : Promise.resolve([]);

            return getUnitPaymentOrders.then((unitPaymentOrders) => {

                var arr = unitPaymentOrders.map((unitPaymentOrder) => {
                    var obj = Object.assign({}, item);
                    obj.unitPaymentOrder = unitPaymentOrder;
                    return obj;
                });
                if (arr.length == 0) {
                    arr.push(Object.assign({}, item, {
                        unitPaymentOrder: null
                    }));
                }
                return Promise.resolve(arr);
            });
        });
        return Promise.all(joinUnitPaymentOrders)
            .then((joinUnitPaymentOrder => {
                return Promise.resolve([].concat.apply([], joinUnitPaymentOrder));
            }));
    }


    extract() {
        var timestamp = new Date(1970, 1, 1);
        return this.purchaseRequestManager.collection.find({
                _updatedDate: {
                    "$gt": timestamp
                }
            }).toArray()
            .then((puchaseRequests) => this.joinPurchaseOrder(puchaseRequests))
            .then((results) => this.joinPurchaseOrderExternal(results))
            .then((results) => this.joinDeliveryOrder(results))
            .then((results) => this.joinUnitReceiptNote(results))
            .then((results) => this.joinUnitPaymentOrder(results));
    }

    transform(data) {
        var result = data.map((item) => {
            var purchaseRequest = item.purchaseRequest;
            var purchaseOrder = item.purchaseOrder;
            var purchaseOrderExternal = item.purchaseOrderExternal;
            var deliveryOrder = item.deliveryOrder;
            var unitReceiptNote = item.unitReceiptNote;
            var unitPaymentOrder = item.unitPaymentOrder;

            var results = purchaseOrder.items.map((poItem) => {
                var poDays = purchaseOrder ? moment(purchaseOrder.date).diff(moment(purchaseRequest.date), "days") : -1;
                var poExtDays = purchaseOrderExternal ? moment(purchaseOrderExternal.date).diff(moment(purchaseOrder.date), "days") : -1;
                var doDays = deliveryOrder ? moment(deliveryOrder.date).diff(moment(purchaseOrderExternal.date), "days") : -1;
                var uroDays = unitReceiptNote ? moment(unitReceiptNote.date).diff(moment(deliveryOrder.date), "days") : -1;
                var upoDays = unitPaymentOrder ? moment(unitPaymentOrder.date).diff(moment(unitReceiptNote.date), "days") : -1;

                return {
                    purchaseRequestNo: purchaseRequest ? purchaseRequest.no : "",
                    purchaseOrderNo: purchaseOrder ? purchaseOrder.no : "",
                    purchaseOrderExternalNo: purchaseOrderExternal ? purchaseOrderExternal.no : "",
                    deliveryOrderNo: deliveryOrder ? deliveryOrder.no : "",
                    unitReceiptNoteNo: unitReceiptNote ? unitReceiptNote.no : "",
                    unitPaymentOrderNo: unitPaymentOrder ? unitPaymentOrder.no : "",

                    purchaseRequestDate: purchaseRequest ? purchaseRequest.date : null,
                    purchaseOrderDays: poDays,
                    purchaseOrderDate: purchaseOrder ? purchaseOrder.date : null,
                    purchaseOrderExternalDays: poExtDays,
                    purchaseOrderExternalDate: purchaseOrderExternal ? purchaseOrderExternal.date : null,
                    deliveryOrderDays: doDays,
                    deliveryOrderDate: deliveryOrder ? deliveryOrder.date : null,
                    unitReceiptNoteDays: uroDays,
                    unitReceiptNoteDate: unitReceiptNote ? unitReceiptNote.date : null,
                    unitPaymentOrderDays: upoDays,
                    unitPaymentOrderDate: unitPaymentOrder ? unitPaymentOrder.date : null,
                    purchaseOrderDaysRange: this.getRangeWeek(poDays),
                    purchaseOrderExternalDaysRange: this.getRangeMonth(poExtDays),
                    deliveryOrderDaysRange: this.getRangeWeek(doDays),
                    unitReceiptNoteDaysRange: this.getRangeWeek(uroDays),
                    unitPaymentOrderDaysRange: this.getRangeMonth(upoDays),
                    // divisionName: purchaseRequest._id,
                    // supplierCode: purchaseOrderExternal._id,
                    // purchasingStaffCode: purchaseOrder._id
                };
            });
            return [].concat.apply([], results);
        });
        return Promise.resolve([].concat.apply([], result));
    }
}
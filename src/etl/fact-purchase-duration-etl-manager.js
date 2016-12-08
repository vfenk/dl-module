'use strict'

// external deps 
var ObjectId = require("mongodb").ObjectId;
var BaseManager = require('module-toolkit').BaseManager;

// internal deps 
require('mongodb-toolkit');

var PurchaseRequestManager = require('../managers/purchasing/purchase-request-manager');
var PurchaseOrderManager = require('../managers/purchasing/purchase-order-manager');
var PurchaseOrderExternalManager = require('../managers/purchasing/purchase-order-external-manager');
var DeliverOrderManager = require('../managers/purchasing/delivery-order-manager');
var UnitReceiptNoteManager = require('../managers/purchasing/unit-receipt-note-manager');
var SupplierManager = require('../managers/master/supplier-manager');

module.exports = class FactPurchaseDurationEtlManager {
    constructor(db, user) {
        this.purchaseRequestManager = new PurchaseRequestManager(db, user);
        this.purchaseOrderManager = new PurchaseOrderManager(db, user);
        this.purchaseOrderExternalManager = new PurchaseOrderExternalManager(db, user);
        this.deliverOrderManager = new DeliverOrderManager(db, user);
        this.unitReceiptNoteManager = new UnitReceiptNoteManager(db, user);
        this.supplierManager = new SupplierManager(db, user);
    }
    run() {
        return this.extract()
            .then((data) => this.transform(data));
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
            var getPurchaseOrderExternal = item.purchaseOrder ? this.purchaseOrderExternalManager.getSingleByQueryOrDefault({
                items: {
                    "$elemMatch": {
                        _id: item.purchaseOrder._id
                    }
                }
            }) : Promise.resolve(null);

            return getPurchaseOrderExternal.then((purchaseOrderExternal) => {
                item.purchaseOrderExternal = purchaseOrderExternal;
                return Promise.resolve(item);
            });
        });
        return Promise.all(joinPurchaseOrderExternals);
    }

    extract() {
        var timestamp = new Date(1970, 1, 1);
        return this.purchaseRequestManager.collection.find({
                _updatedDate: {
                    "$gt": timestamp
                }
            }).toArray()
            .then((puchaseRequests) => this.joinPurchaseOrder(puchaseRequests))
            .then((results) => this.joinPurchaseOrderExternal(results));
    }

    transform(data) {
        return Promise.resolve(data);
    }

    load() {

    }
}

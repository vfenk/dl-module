require("should");
var helper = require("../../../helper");

var purchaseRequestDataUtil = require('../../../data').transaction.purchaseRequest;
var validatePR = require("dl-models").validator.purchasing.purchaseRequest;
var PurchaseRequestManager = require("../../../../src/managers/purchasing/purchase-request-manager");
var purchaseRequestManager = null;
var purchaseRequest;

var generateCode = require('../../../../src/utils/code-generator');

var purchaseOrderDataUtil = require('../../../data').transaction.purchaseOrder;
var validatePO = require("dl-models").validator.purchasing.purchaseOrder;
var PurchaseOrderManager = require("../../../../src/managers/purchasing/purchase-order-manager");
var purchaseOrderManager = null;
var purchaseOrder;
var purchaseOrders=[];
var purchaseRequests=[];
var purchaseRequestsPosted=[];

var purchaseOrderExternalDataUtil = require('../../../data').transaction.purchaseOrderExternal;
var validatePO = require("dl-models").validator.purchasing.purchaseOrderExternal;
var PurchaseOrderExternalManager = require("../../../../src/managers/purchasing/purchase-order-external-manager");
var purchaseOrderExternalManager = null;
var purchaseOrderExternal;


before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            purchaseRequestManager = new PurchaseRequestManager(db, {
                username: 'dev'
            });
            purchaseOrderManager = new PurchaseOrderManager(db, {
                username: 'dev'
            });

    done();
                       
        })
        .catch(e => {
            done(e);
        });
});

 

// var kodeUnik;
// var PO;
// it('#02. should success when create 20 data PO', function (done) {
//     var data = []; 
//     var datepr = new Date();
//     var tasks=[];
//     kodeUnik = generateCode();
//     for (var i = 0; i < PR.length; i++) { 
//         var po = purchaseOrderDataUtil.getNew(PR[i]); 
//         data.push(po); 
//     } 
     
//     Promise.all(data) 
//         .then((result) => {
//             for (var i = 0; i < PR.length; i++) {
//                 result[i].remark=kodeUnik;
//                 result[i].date= datepr.setDate(datepr.getDate() - (i*2));
//                 tasks.push(purchaseOrderManager.update(result[i]));
//             }
//             PO=result;
//             Promise.all(tasks)
//                         .then(result => {
//                             resolve(result);
                            
//                         })
//                         .catch(e => {
//                            done(e);
//                         });
//             done(); 
//         }).catch(e => {
//             done(e);
//         });
       
//    });

it('#01. should success when create 20 PO External data', function (done) {
    var data = []; 
    for (var i = 0; i < 20; i++) { 
        var poe = purchaseOrderExternalDataUtil.getPosted();  
        data.push(poe); 
    } 
    Promise.all(data) 
        .then((result) => { 
            resolve(result);
            done(); 
        }).catch(e => {
            done(e);
        });
});

it('#02. should success when get data report', function (done) {
    purchaseOrderManager.getDataPOUnitCategory()
    .then(po => {
        po.should.instanceof(Object);
        done();
    }).catch(e => {
            done(e);
        });

});

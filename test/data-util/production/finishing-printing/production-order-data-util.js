'use strict'
var helper = require('../../../helper');
var ProductionOrderManager = require('../../../../src/managers/production/finishing-printing/production-order-manager');
var codeGenerator = require('../../../../src/utils/code-generator');
var buyer = require('../../master/buyer-data-util');
var uom = require('../../master/uom-data-util');
var lampStandard = require('../../master/lamp-standard-data-util');
var instruction = require('../../master/instruction-data-util');

class ProductionOrderDataUtil {
    getNewData() {
        return Promise.all([uom.getTestData(), buyer.getTestData(), lampStandard.getTestData(), instruction.getTestData()])
            .then((results) => {
                var uom = results[0];
                var buyer = results[1];
                var lampStandard = results[2];
                var instruction = results[3];

                var data = {
                    
                    salesContractNo: `UT/Prod/1KQ3VP55`,
                    orderNo: `orderNo/${codeGenerator()}`,
                    uomId: uom._id,
                    uom: uom,
                    buyerId: buyer._id,
                    buyer: buyer,
                    lampStandardId: lampStandard._id,
                    lampStandard: lampStandard,
                    instructionId: instruction._id,
                    instruction: instruction,
                    isExport:true,
                    processType: instruction.processType,
                    orderType: `Order`,
                    construction:instruction.construction,
                    material:instruction.material,
                    orderQuantity:30,
                    spelling:5,

                    originGreigeFabric:`greige`,
                    finishWidth:`width`,
                    design:`design`,
                    handlingStandard:`handling`,
                    RUN:`run`,
                    shrinkageStandard:`shrink`,
                    rollLength:`length`,
                    sample:`sample`,
                    deliveryDate:new Date(),
                    remark:`desc`,
                    details: [{
                        code:`code1/${codeGenerator()}`,
                        colorRequest:`reddish`,
                        colorTemplate:`template1`,
                        quantity:10,
                        uomId: uom._id,
                        uom:uom,
                    }, {
                        code:`code2/${codeGenerator()}`,
                        colorRequest:`gray`,
                        colorTemplate:`template2`,
                        quantity:20,
                        uomId: uom._id,
                        uom:uom,
                    }]
                };
                return Promise.resolve(data);
            });
    }
    

    getNewTestData() {
        return helper
            .getManager(ProductionOrderManager)
            .then((manager) => {
                return this.getNewData().then((data) => {
                    return manager.create(data)
                        .then((id) => manager.getSingleById(id));
                });
            });
    }
}
module.exports = new ProductionOrderDataUtil();
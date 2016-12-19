"use strict";
var _getSert = require("../getsert");
var generateCode = require("../../../src/utils/code-generator");

class InstructionDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/master/instruction-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                material        : data.material,
                construction    : data.construction,
                processType     : data.processType
            };
        });
    }

    getNewData() {
        var Model = require('dl-models').master.Instruction;
        var data = new Model();

        var code = generateCode();

        data.material = `material[${code}]`;
        data.construction = `construction[${code}]`;
        data.processType = `processType[${code}]`;
        data.steps=[`step1[${code}]`,`step2[${code}]`,`step3[${code}]`];

        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            material: 'CD 40 X CD 40 material',
            construction: '2/1 133 construction',
            processType: 'WHITE',
            steps:['BLEACHING','SCOURING','MERCERIZE']
        };
        return this.getSert(data);
    }
}
module.exports = new InstructionDataUtil();
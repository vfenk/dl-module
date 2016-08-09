'use strict'

var BaseModel = require('capital-models').BaseModel;

class UoM_Template {
    constructor() {
        this.mainValue = 0;
        this.mainUnit = '';
        this.convertedValue = 0;
        this.convertedUnit = '';
    }
}

class UoM extends BaseModel {
    constructor(source) {
        super('UoM', '1.0.0');

        this.category = '';
        this.default = new UoM_Template();      // To determine default value of each UoM Category, and used to validate each Unit.  

        var _units = [];
        _units.push(new UoM_Template());
        this.units = _units;

        this.copy(source);
    }
}

module.exports = {
    UoM: UoM,
    UoM_Template: UoM_Template
}
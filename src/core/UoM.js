'use strict'

var BaseModel = require('capital-models').BaseModel;

class UoM_Template {
    constructor(source) {
        this.mainValue = source ? source.mainValue : 0;
        this.mainUnit = source ? source.mainUnit : '';
        this.convertedValue = source ? source.convertedValue : 0;
        this.convertedUnit = source ? source.convertedUnit : '';
    }
}

class UoM extends BaseModel {
    constructor(source) {
        super('UoM', '1.0.0');

        this.category = '';
        this.default = new UoM_Template();      // To determine default value of each UoM Category, and used to validate each Unit.  
        this.units = [];

        this.copy(source);

        var _units = [];
        for (var item of this.units) {
            _units.push(new UoM_Template(item));
        }
        this.units = _units;
    }
}

module.exports = {
    UoM: UoM,
    UoM_Template: UoM_Template
}

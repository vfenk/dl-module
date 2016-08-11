'use strict'

var BaseModel = require('capital-models').BaseModel;

class UoM_Template {
    constructor(source) {
        this.mainValue = source.mainValue ? source.mainValue : 0;
        this.mainUnit = source.mainUnit ? source.mainUnit : '';
        this.convertedValue = source.convertedValue ? source.convertedValue : 0;
        this.convertedUnit = source.convertedUnit ? source.convertedUnit : '';
    }
}

class UoM extends BaseModel {
    constructor(source) {
        super('UoM', '1.0.0');

        this.category = '';
        this.default = {};      // To determine default value of each UoM Category, and used to validate each Unit.  
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

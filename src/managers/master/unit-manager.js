'use strict'

var ObjectId = require("mongodb").ObjectId;

require("mongodb-toolkit");

var DLModels = require('dl-models');
var map = DLModels.map;
var Unit = DLModels.master.Unit;

module.exports = class UnitManager {

    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.UnitCollection = this.db.use(map.master.collection.Unit);
    }

    create(unit) {
        return new Promise((resolve, reject) => {
            // this._validate(unit)
            //     .then(validunit => {
                    this.UnitCollection.insert(unit)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                // })
                // .catch(e => {
                //     reject(e);
                // })
        });
    } 
   
}
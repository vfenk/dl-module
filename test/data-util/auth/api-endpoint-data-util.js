"use strict";
var _getSert = require("../getsert");
var generateCode = require("../../../src/utils/code-generator");
var Role = require("./role-data-util");

class ApiEndpointDataUtil {
    getSert(input) {
        var ManagerType = require("../../../src/managers/auth/api-endpoint-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                name: data.name
            };
        });
    }

    getNewData(pRole) {
        var getRole;
        if (pRole)
            getRole = Promise.resolve(pRole);
        else
            getRole = Role.getTestData();

        return getRole
            .then((role) => {

                var Model = require("dl-models").auth.ApiEndpoint;
                var data = new Model();

                var code = generateCode();

                data.name = `${code}`;
                data.method = `GET`;
                data.uri = `unit/test/${code}`;
                data.isLocked = false;
                data.roles = [role];

                return Promise.resolve(data);
            });
    }

    getNewTestData(role) {
        return this.getNewData(role)
            .then(this.getSert);
    }

    getTestData() {
        return this.getNewData()
            .then((data) => {
                data.name = "UTENDPOINT";
                data.uri = "unit/test/endpoint"; 
                return this.getSert(data);
            });
    }
}
module.exports = new ApiEndpointDataUtil();

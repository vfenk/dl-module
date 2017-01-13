require("should");
var helper = require("../../helper");

var accountDataUtil = require("../../data-util/auth/account-data-util");
var validateAccount = require("dl-models").validator.auth.account;
var AccountManager = require("../../../src/managers/auth/account-manager");
var accountManager = null;
var account;

var roleDataUtil = require("../../data-util/auth/role-data-util");
var validateRole = require("dl-models").validator.auth.role;
var RoleManager = require("../../../src/managers/auth/role-manager");
var roleManager = null;
var role;

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            roleManager = new RoleManager(db, {
                username: 'dev'
            });
            accountManager = new AccountManager(db, {
                username: 'dev'
            });

            roleDataUtil.getNewTestData()
                .then(_role => {
                    role = _role;
                    validateRole(role);
                    return Promise.resolve(role)
                })
                .then((role) => {
                    return accountDataUtil.getNewTestData(role);
                })
                .then((_account) => {
                    account = _account;
                    validateAccount(account);
                    done();
                })
                .catch(e => {
                    done(e);
                });
        })
        .catch(e => {
            done(e);
        });
});

it('#01. role permissions.permission should updated when update permissions.permission', function(done) {
    var oldPermission = role.permissions[0];
    oldPermission.permission = 0;

    roleManager.update(role)
        .then((roleId) => {
            return roleManager.getSingleById(roleId);
        })
        .then((updatedRole) => {
            var newPermission = updatedRole.permissions[0];
            oldPermission.permission.should.equal(newPermission.permission);
            role = updatedRole;
            done();
        })
        .catch(e => {
            done(e);
        });
});


it('#02. assigned users.role.permissions should same with role.permissions', function(done) {
    accountManager.getSingleById(account._id)
        .then((targetAccount) => {
            var userRole = targetAccount.roles.find((r) => r._id.toString() === role._id.toString());
            userRole.should.not.equal(null);

            for (var rolePermission of role.permissions) {
                var userPermission = userRole.permissions.find((p) => p.unitId.toString() === rolePermission.unitId.toString())
                userPermission.should.not.equal(null);
                userPermission.permission.should.equal(rolePermission.permission);
            }
            done();
        })
        .catch(e => {
            done(e);
        });
});

module.exports = {
    getConnection: function () {
        var sql = require("mssql");
        var config = {
            server: process.env.SQL_SERVER,
            database: process.env.SQL_DATABASE,
            user: process.env.SQL_USERNAME,
            password: process.env.SQL_PASSWORD,
            options: {
                encrypt: true
            },
            connectionTimeout: 120 * 60 * 1000,
            requestTimeout: 1000000
        };
        return new Promise((resolve, reject) => {
            sql.connect(config, function (err) {
                resolve(new sql.Request());
            });
        });
    }
};
var sql = require("mssql");

var config = {

    user: "danliris-admin",
    password: "Standar123",
    server: "danliris-uat.database.windows.net,1433",
    database: "danliris-dwh-uat",
    options: {
        encrypt: true
    }

};

module.exports= {
    getConnect: function() {
        return new Promise((resolve, reject) => {
            sql.connect(config, function (err) {
                resolve( new sql.Request());
            })
        });
    } 
}
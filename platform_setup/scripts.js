var connection = require('../config/db');
const config = require('./config');

const createdb = (req, res, next) => {

    var sql1 = "CREATE DATABASE IF NOT EXISTS ? USE ? ";

    connection.query(sql1, [config.db_name, config.db_name], function (err, result, fields) {
        if (err) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "erreur survenue"
            })
        }
        else {
            res.json({ result });
        }

    });
};

const createtable = (req, res, next) => {
    var data_type;
    for (table in config.table_config) {
        console.log(table)

        var sql1 = "CREATE TABLE IF NOT EXISTS " + table + " ( id bigint(20) NOT NULL AUTO_INCREMENT,PRIMARY KEY (id) )";
        connection.query(sql1, function (err, result, fields) {
            if (err) {
                console.log("error ocurred", err);
            }
            else {
                for (field in config.table_config[table]) {

                    var coloumn = field;
                    // for (fields in config.table_config[table][field]) {
                    //console.log("      Fields :" + fields + ", value  :" + config.table_config[table][field][fields]);
                    console.log(config.table_config[table][field]["data_type"] + "  " + config.table_config[table][field]["length"]);
                    // console.log(JSON.stringify(config.table_config[table]));
                
                   var sql2 = "ALTER TABLE " + table + " ADD " + coloumn + " " + config.table_config[table][field]["data_type"] + "(" + config.table_config[table][field]["length"] + ")";
                
                    connection.query(sql2, function (error, result, fields) {
                        if (error) {
                            console.log("error ocurred", error);
                        }
                        else {
                
                
                            //res.json({ result });
                        }
                
                    });
                }

                for (field in config.table_config[table]) {
                    for (fields in config.table_config[table][field]) {
                    //console.log("      Fields :" + fields + ", value  :" + config.table_config[table][field][fields]);
                    console.log(fields);
                    if(fields=="reference_table"){
                    //console.log(config.table_config[table][field]["data_type"] + "  " + config.table_config[table][field]["length"]);
                    // console.log(JSON.stringify(config.table_config[table]));
                
                   var sql2 = "ALTER TABLE "+ table+" ADD CONSTRAINT FK_"+table+"_"+field+" FOREIGN KEY ("+field +") REFERENCES "+config.table_config[table][field]["reference_table"]+"(id)";
                
                    connection.query(sql2, function (error, result, fields) {
                        if (error) {
                            console.log("error ocurred", error);
                        }
                        else {
                
                
                            //res.json({ result });
                        }
                
                    });
                }
            }
                }
             
            }
        });
    }
            
};

const altertable = (req, res, next) => {
for (table in config.table_config) {

    }
};

const setreferncetable = (req, res, next) => {
    for (table in config.table_config) {
  
        }
    };

 createtable();
 altertable();
setreferncetable();

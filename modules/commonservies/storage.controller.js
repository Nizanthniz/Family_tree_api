
var storage_type = require('../../config/strorage')
require('dotenv').config();
var connection = require("../../config/db");
var fs = require('fs');
const DateTime = require('node-datetime/src/datetime');




function UploadPost(req, res) {
  var path= process.env.post_path;
  var response = [];


  const now = new DateTime().format("Y_m_d_H_M_S");
  let now1 = now.toString().trim();
  var post_id = res;

  if (!req) {
    response = {
      status: "400",
      response: "No files were uploaded.",
    };
    return response;
  } else if (req.length == undefined) {
    let sampleFile = req;
    if (!fs.existsSync(path + "/" + post_id)) {
      fs.mkdirSync(path + "/" + post_id);
    }
    console.log(sampleFile.name.toString().trim().replaceAll(/\s/g, ''))
    sampleFile.mv(
      path + "/" + post_id + "/" + now1.concat(sampleFile.name.toString().trim().replaceAll(/\s/g, '')),
      function (err) {
        if (err) {
          response = {
            status: "400",
            response: err,
          };
          return response;
        }
      }
    );
    var sql = "INSERT INTO upload_post(post_id, post,delete_flag) VALUES ?";
    var VALUES = [
      [post_id, post_id + "/" + now1.concat(sampleFile.name.toString().trim().replaceAll(/\s/g, '')), 0],
    ];
    connection.query(sql, [VALUES], function (err, result, cache) {
      if (err) throw err;
      console.log("1 record inserted");

      if (cache.isCache == false) {
        connection.flush();
      }
    });
    response = {
      status: "200",
      response: "Post uploaded!",
    };
    return response;
  } else {
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req;
    // Use the mv() method to place the file somewhere on your server
    if (!fs.existsSync(path + "/" + post_id)) {
      fs.mkdirSync(path + "/" + post_id);
    }
    sampleFile.forEach((file) => {
      file.mv(path + "/" + post_id + "/" + now1.concat(file.name.toString().trim().replaceAll(/\s/g, '')), function (err) {
        if (err) {
          response = {
            status: "400",
            response: err,
          };
          return response;
        }
      });
    });
    sampleFile.forEach((file) => {
      var sql = "INSERT INTO upload_post(post_id, post,delete_flag) VALUES ?";
      var VALUES = [
        [post_id, post_id + "/" + now1.concat(file.name.toString().trim().replaceAll(/\s/g, '')), 0],
      ];
      connection.query(sql, [VALUES], function (err, result) {
        if (err) {
          response = {
            status: "400",
            response: err,
          };
          return response;
        }
      });
    });
    response = {
      status: "200",
      response: "Post uploaded!",
    };
    return response;
  }
}

module.exports = { UploadPost };
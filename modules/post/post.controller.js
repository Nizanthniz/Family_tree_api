var storage = require("../commonservies/storage.controller");
var connection = require("../../config/db");
const postsUpload = (req, res, next) => {
  if (
    req.body.post_description == null ||
    req.body.post_description == "" ||
    req.body.post_description == undefined ||
    req.body.post_captions == null ||
    req.body.post_captions == "" ||
    req.body.post_captions == undefined ||
    req.body.user_id == null ||
    req.body.user_id == "" ||
    req.body.user_id == undefined
  ) {
    res.status(200).send({
      status: "400",
      message: "Wrong Data Entry",
      data: req.body,
    });
  } else if (!req.files) {
    res.status(200).send({
      status: "400",
      message: "No Files Are Selected",
      data: req.files,
    });
  } else {
    //console.log((req.files.sampleFile).length);

    var post_captions = req.body.post_captions;
    var post_description = req.body.post_description;
    var tags = req.body.tags;
    var post_id = req.body.post_id;
    var is_update = req.body.is_update;
    var schedule_id = req.body.schedule_id;
    var user_id = req.body.user_id;
    console.log(req.body);
    console.log(req.files);
    if (is_update == "true") {
      var sql = "update upload_post set delete_flag=1 where post_id=?";
      connection.query(sql, [post_id], function (err, result) {
        if (err) {
          response = {
            status: "400",
            message: "No Data Found",
            response: err,
          };
          res.send(response);
        } else {
          var sql =
            "update post i set post_captions=?,post_description=?,tags=?,post=1 where i.id=?";
          connection.query(
            sql,
            [post_captions, post_description, tags, post_id],
            function (err, result) {
              if (err) {
                response = {
                  status: "400",
                  message: "No Data Found",
                  response: err,
                };
                res.send(response);
              } else {
                if (
                  req.files.sampleFile != null ||
                  req.files.sampleFile != undefined
                ) {
                  const resp = storage.UploadPost(
                    req.files.sampleFile,
                    post_id
                  );
                  res.send(resp);
                } else {
                  res.send(req.body);
                }
              }
            }
          );
        }
      });
    } else {
      var sql =
        "insert into post (post_captions,post_description,tags,post,schedule_id,user_id) values ?";
      var values = [
        [post_captions, post_description, tags, 1, schedule_id, user_id],
      ];
      connection.query(sql, [values], function (err, result) {
        if (err) {
          response = {
            status: "400",
            message: "No Data Found",
            response: err,
          };
          res.send(response);
        } else {
          if (
            req.files.sampleFile != null ||
            req.files.sampleFile != undefined
          ) {
            const resp = storage.UploadPost(
              req.files.sampleFile,
              result.insertId
            );
            res.send(resp);
          } else {
            res.send(req.body);
          }
        }
      });
    }
  }
};

const updateposts = (req, res, next) => {
  //console.log((req.files.sampleFile).length);
  var user_id = req.body.user_id;

  var sql = "update post i set i.delete_flag=1 where i.user_id=?";
  var VALUES = [[user_id]];
  connection.query(sql, [VALUES], function (err, result) {
    if (err) throw err;
  });
  const resp = storage.UploadPost(req.files.sampleFile, req.user_id);
  return res.send(resp);
};

const getAllPostuserid = (req, res, next) => {
  if (
    req.body.user_id == null ||
    req.body.user_id == "" ||
    req.body.user_id == undefined
  ) {
    res.status(200).send({
      status: "400",
      message: "Wrong Data Entry",
      data: req.body,
    });
  } else {
    var user_id = req.body.user_id;

    var sql = "SELECT p.id AS post_id,p.user_id,p.created_at,p.likes,p.comments,p.post_captions,p.post_description,json_array(GROUP_CONCAT(up.`post`))  AS post,u.user_name,u.user_profile from post p JOIN upload_post up ON p.id=up.post_id JOIN users u ON p.user_id=u.id WHERE p.user_id IN( SELECT id FROM users WHERE family_id IN( SELECT i.family_id FROM users i WHERE i.id=?) ) AND up.delete_flag=0 GROUP BY p.id";
    connection.query(sql, [user_id], function (err, result) {
      if (err) {
        response = {
          status: "400",
          message: "No Data Found",
          response: err,
        };
        res.send(response);
      } else {
        result.length>0?
        response = {
            status: "200",
            message:"Data Found",
            response: result
          }:response = {
            status: "200",
            message:"No Data Found",
            response:[]
          }
          res.send(response);

      }
    });
  }
};

module.exports = {
  postsUpload,
  updateposts,
  getAllPostuserid
};

var storage = require("../commonservies/storage.controller");
var connection = require("../../config/db");
const moment = require('moment');
const postsUpload = async (req, res, next) => {
  console.log(req.files.sampleFile);
  console.log("public_id",req.body.family_ids);
  var family_ids = req.body.family_ids.split(',');
  // public = 0 --> family
  // public = 1 --> public
  // public = 2 --> group
  // public = 3 --> individual

  //console.log((req.files.sampleFile).length);

  var post_captions = req.body.post_captions;
  var post_description = req.body.post_description;
  var post_id = req.body.post_id;
  var is_update = req.body.is_update;
  var user_id = req.body.user_id;
  var is_public = req.body.is_public;
  var public_id=[]
  var family_id=[];
  var group_id = [];
  var individual = [];
  var response=[];
 
  is_public == 1 ? 
  
  
  await getAllFamilyByUserIds(user_id).then((data) => { public_id = data.map((d) => { return d.family_id }) }) 
  
  : is_public == 0 ?  family_id=family_ids : is_public == 2 ? group_id=family_ids   : individual=family_ids;
  console.log("public_id",family_id);
  console.log("-------->", family_id);
  console.log(req.body.family_ids,"hi");
  console.log(req.files);
  if (is_update == "true") {
    var sql = "update upload_post set delete_flag=1 where post_id=?";
    connection.query(sql, [post_id], function (err, result, cache) {
      if (err) {
        response = {
          status: "400",
          message: "No Data Found",
          response: err,
        };
        res.send(response);
      } else {
        var sql =
          "update post i set post_captions=?,post_description=? where i.id=?";
        connection.query(
          sql,
          [post_captions, post_description, post_id],
          async function (err, result) {
            if (err) {
              response = {
                status: "400",
                message: "No Data Found",
                response: err,
              };
              res.send(response);
            } else {
              if (cache.isCache == false) {
                connection.flush();
              }
              individual.push(req.body.user_id)

              var fam_group_array =[];

              family_id.length > 0 ? fam_group_array = family_id : group_id.length > 0 ? fam_group_array = group_id :  public_id.length>0 
              
              ? fam_group_array = public_id : fam_group_array = individual



              addShowPostDetails(fam_group_array, post_id, true,is_public).then((data) => {

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
              );

            }
          }
        );
      }
    });
  } else {
    var sql =
      "insert into post (post_captions,post_description,user_id) values ?";
    var values = [
      [post_captions, post_description, user_id],
    ];
    connection.query(sql, [values], async function (err, result, cache) {
      if (err) {
        response = {
          status: "400",
          message: "No Data Found",
          response: err,
        };
        res.send(response);
      } else {
        var fam_group_array =[];
        individual.push(req.body.user_id)
        console.log(public_id,"publix")

              family_id.length > 0 ? fam_group_array = (family_id) : group_id.length > 0 ? fam_group_array=group_id :  public_id.length>0 
              
              ? fam_group_array = public_id : fam_group_array=individual
              console.log(fam_group_array,"fam_group_array")
          addShowPostDetails(fam_group_array, result.insertId, false,is_public).then((data) => {

            console.log(".............",data)
        if (cache.isCache == false) {
          connection.flush();
        }
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
      });


      }
    });
  }

};

async function getlast_comment_for_deletecomment(user_id, post_id, res) {
  return new Promise(async function (resolve, reject) {

    var sql1 = "SELECT pc.comments AS comment ,pc.id AS comment_id,DATE_FORMAT(pc.created_at,'%Y-%m-%d ') as date,pc.created_at AS time,u.user_name,u.id  AS user_id ,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as profile_image ,case when pc.user_id=? then 'true' ELSE 'false' END AS own_comment  FROM post_comment pc JOIN users u ON u.id=pc.user_id  WHERE pc.post_id=? and u.delete_flag='0' and u.is_admin='0' and pc.delete_flag='0' order by pc.id desc limit 1";

    connection.query(sql1, [process.env.profile_image_show_path, user_id, post_id], function (err, ret, cache) {

      if (ret.length > 0) {
        console.log(ret)
        resolve(ret)
      }
      else {
        if (cache.isCache == false) {
          connection.flush();
        }
        resolve([])
      }
    });


  });
};

const deletepostbyid = (req, res, next) => {
  var response = [];
  var id = req.body.post_id;
  var sql = "update post i set i.delete_flag=1 where i.id=?";
  connection.query(sql, [id], function (err, result) {
    if (err) {
      response = {
        status: '400',
        message: 'No Data Found',
        response: err,
      }
      res.send(response);
    }
    else {
      response = {
        status: '200',
        message: 'Post Deleted Successfully'
      }
      res.send(response);
    }
  });
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
    var user_profile_path, post_path;
    user_profile_path = process.env.profile_image_show_path;
    post_path = process.env.post_show_path

    var sql = "SELECT p.id AS post_id,p.user_id,p.created_at,p.likes,p.comments,p.post_captions,p.post_description,GROUP_CONCAT(CONCAT(?, CASE WHEN up.post != '' THEN  CONCAT(up.post) END))  AS post,u.user_name, CONCAT(?, CASE WHEN u.user_profile != '' THEN  CONCAT(u.user_profile) end) as user_profile  from post p JOIN upload_post up ON p.id=up.post_id JOIN users u ON p.user_id=u.id WHERE p.id IN(SELECT uf.post_id FROM show_post uf WHERE uf.family_id IN(  SELECT i.family_id FROM users_family_details i WHERE i.user_id=?)  OR  uf.group_id IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id=? AND gm.`status`='0' ) OR uf.individual_id=? AND uf.is_delete='0' group BY uf.post_id)  AND p.delete_flag=0 AND up.delete_flag=0 GROUP BY p.id ORDER BY p.created_at desc";
    connection.query(sql, [post_path, user_profile_path,user_id,user_id,user_id], async function (err, result, cache) {
      if (err) {
        response = {
          status: "400",
          message: "No Data Found",
          response: err,
        };
        res.send(response);
      } else {
        if (cache.isCache == false) {
          connection.flush();
        }

        var j, i = 0, last_comment1 = [];

        var response = [];
        if (result.length > 0) {

        await  result.forEach(async (vals) => {
           
console.log(j);
           await getlast_comment_for_deletecomment(vals.user_id, vals.post_id).then((last_comment) => {
            j = vals.post.split(",");
              response.push({
                "post_id": vals.post_id,
                "user_id": vals.user_id,
                "created_at": vals.created_at,
                "likes": vals.likes,
                "comments": vals.comments,
                "post_captions": vals.post_captions,
                "post_description": vals.post_description,
                "post": j,
                "user_name": vals.user_name,
                "user_profile": vals.user_profile,
                "last_comment": last_comment
              })
              result.length == response.length && response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) && res.send({
                status: "200",
                message: "Data Found",
                response: response
              });
            }
            )
          })







        }
        else {
          response = {
            status: "200",
            message: "No Data Found",
            response: []
          }
          res.send(response);
        }
      }
    });
  }
};


const Test = (req, res, next) => {
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
    var user_profile_path, post_path;
    user_profile_path = process.env.profile_image_show_path;
    post_path = process.env.post_show_path

    var sql = "SELECT p.id AS post_id,p.user_id,p.created_at,p.likes,p.comments,p.post_captions,p.post_description,GROUP_CONCAT(CONCAT(?, CASE WHEN up.post != '' THEN  CONCAT(up.post) END))  AS post,u.user_name, CONCAT(?, CASE WHEN u.user_profile != '' THEN  CONCAT(u.user_profile) end) as user_profile  from post p JOIN upload_post up ON p.id=up.post_id JOIN users u ON p.user_id=u.id WHERE p.user_id IN( SELECT id FROM users WHERE family_id IN( SELECT i.family_id FROM users i WHERE i.id=?) ) AND p.delete_flag=0 AND up.delete_flag=0 GROUP BY p.id ORDER BY p.created_at desc";
    connection.query(sql, [post_path, user_profile_path, user_id], function (err, result, cache) {
      if (err) {
        response = {
          status: "400",
          message: "No Data Found",
          response: err,
        };
        res.send(response);
      } else {
        if (cache.isCache == false) {
          connection.flush();
        }

        var j, last_comment = {};

        var response = [];
        if (result.length > 0) {

          result.forEach((vals) => {
            j = vals.post.split(",")
            getlast_comment_for_deletecomment(vals.user_id, vals.post_id).then((last_comment) => {
              response.push({
                "post_id": vals.post_id,
                "user_id": vals.user_id,
                "created_at": vals.created_at,
                "likes": vals.likes,
                "comments": vals.comments,
                "post_captions": vals.post_captions,
                "post_description": vals.post_description,
                "post": j,
                "user_name": vals.user_name,
                "user_profile": vals.user_profile,
                "last_comment": last_comment
              })
              result.length == response.length && response.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) && res.send({
                status: "200",
                message: "Data Found",
                response: response
              });
            }
            )
          })


          // res.send(result)
        }
        else {
          response = {
            status: "200",
            message: "No Data Found",
            response: []
          }
          res.send(response);
        }
      }
    });
  }
};


const CommentPost = async (req, res, next) => {

  var comment = req.body.comment;
  var user_id = req.body.user_id;
  var post_id = req.body.post_id;
  var comment_id = req.body.comment_id;
  let create_at = new Date().toISOString();
  let update_at = moment().utc().format("HH:mm:ss");
  let date_at = moment().utc().format("YYYY-MM-DD ");
  let time_at = moment().utc().format("HH:mm");
  let times_at = new Date().toISOString();
  var response = [];
  var user_profile_path = process.env.profile_image_show_path;

  if (comment_id == undefined || comment_id == '') {


    var sql = "insert  into post_comment (post_id,user_id,comments,created_at,date_at,time_at,delete_flag) values ?";
    var VALUES = [[post_id, user_id, comment, create_at, date_at, time_at, 0],];
    connection.query(sql, [VALUES], async function (err, results) {
      if (err) {
        response = {
          status: '400',
          response: err
        }
        res.status(400).send(response);
      }

      else {
        console.log("hi");
        var comment_insert_id = results.insertId;
        var sq2 = "select i.comments from post i  where i.id=? ";
        connection.query(sq2, [post_id], async function (err, result, cache) {
          if (err) {
            response = {
              status: '400',
              response: err
            }
            res.status(400).send(response);
          }
          else {
            if (cache.isCache == false) {
              connection.flush();
            }
            var sq3 = "SELECT u.user_name,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as user_profile  FROM users u  WHERE u.id=? and u.delete_flag='0' and u.is_admin='0'";
            connection.query(sq3, [user_profile_path, user_id], function (err, resultinst, cache) {
              if (err) {
                response = {
                  status: '400',
                  response: err
                }
                res.status(400).send(response);
              }
              else {

                if (cache.isCache == false) {
                  connection.flush();
                }
                var user_name = resultinst[0].user_name;
                var user_profile = resultinst[0].user_profile;
                var comments = result[0].comments;
                comments = comments + 1;

                var sq4 = "update post i set comments=? where i.id=?";
                connection.query(sq4, [comments, post_id], function (err, resultinst) {
                  if (err) {
                    response = {
                      status: '400',
                      response: err
                    }
                    res.status(400).send(response);
                  }
                  else {
                    response = {
                      status: '200',
                      message: "Comments updated",
                      data: {
                        "total_comment": comments,
                        "last_comment":
                        {
                          "user_id": user_id,
                          "user_name": user_name,
                          "profile_image": user_profile,
                          "comment": comment,
                          "date": date_at,
                          "time": times_at,
                          "comment_id": comment_insert_id

                        }
                      }

                    }


                    res.status(200).send(response);
                  }
                });
              }
            });

          }


        });

      }

    });


  }
  else {
    var sql = "UPDATE post_comment SET post_id=?,user_id=?,comments=?,created_at=?,date_at=?,time_at=? where id=?";

    connection.query(sql, [post_id, user_id, comment, create_at, date_at, time_at, comment_id], function (err, results) {
      if (err) {
        response = {
          status: '400',
          response: err
        }
        res.status(400).send(response);
      }
      else {
        var sq2 = "select i.comments from post i  where i.id=?";
        connection.query(sq2, [post_id], function (err, result, cache) {
          if (err) {
            response = {
              status: '400',
              response: err
            }
            res.status(400).send(response);
          }
          else {
            if (cache.isCache == false) {
              connection.flush();
            }
            var sq3 = "SELECT u.user_name,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as user_profile  FROM users u  WHERE u.id=? and u.delete_flag='0' and u.is_admin='0'";
            connection.query(sq3, [user_profile_path, user_id], function (err, resultinst, cache) {
              if (err) {
                response = {
                  status: '400',
                  response: err
                }
                res.status(400).send(response);
              }
              else {
                if (cache.isCache == false) {
                  connection.flush();
                }

                var user_name = resultinst[0].user_name;
                var user_profile = resultinst[0].user_profile;
                var comments = result[0].comments;

                response = {
                  status: '200',
                  message: "Comments updated",
                  data: {
                    "total_comment": comments,
                    "last_comment":
                    {
                      "user_id": user_id,
                      "user_name": user_name,
                      "profile_image": user_profile,
                      "comment": comment,
                      "date": date_at,
                      "time": times_at,
                      "comment_id": comment_id,

                    }
                  }

                }


                res.status(200).send(response);


              }
            });
          }
        });
      }
    });

  }


}


const likepost = async (req, res, next) => {

  var response = [];
  var is_like = req.body.is_like;
  var user_id = req.body.user_id;
  var post_id = req.body.post_id;


  if (is_like == true) {
    var sql = "select * from post_likes where post_id=? and user_id=? ";
    connection.query(sql, [post_id, user_id], async function (err, resultss, cache) {
      if (err) {
        response = {
          status: '400',
          message: 'No Data Found',
          response: err,
        }
        res.send(response);
      }
      else {
        if (resultss.length > 0) {
          if (cache.isCache == false) {
            connection.flush();
          }
          response = {
            status: '200',
            message: 'Likes Updated',
          }
          res.send(response);
        }
        else {
          var sql = "insert  into post_likes (post_id,user_id) values ?";
          var VALUES = [[post_id, user_id],];
          connection.query(sql, [VALUES], async function (err, result) {
            if (err) {
              response = {
                status: '400',
                message: 'No Data Found',
                response: err,
              }
              res.send(response);
            }
            else {
              var sq2 = "select i.likes from post i where i.id=?";
              connection.query(sq2, [post_id], function (err, result, cache) {
                if (err) {
                  response = {
                    status: '400',
                    message: 'No Data Found',
                    response: err,
                  }
                  res.send(response);
                }
                else {
                  if (cache.isCache == false) {
                    connection.flush();
                  }
                  var likes = result[0].likes;
                  likes = likes + 1;
                  var sq3 = "update post i set likes=? where i.id=?";
                  connection.query(sq3, [likes, post_id], function (err, result) {
                    if (err) {
                      response = {
                        status: '400',
                        message: 'No Data Found',
                        response: err,
                      }
                      res.send(response);
                    }
                    else {
                      response = {
                        status: '200',
                        message: 'Likes Updated',
                        "like_count": likes
                      }
                      res.send(response);
                    }

                  });
                }
              });
            }
          });
        }
      }
    });
    //
  }
  else if (is_like == false) {

    var sql1 = "select * from post_likes where post_id=? and user_id=? ";
    connection.query(sql1, [post_id, user_id], async function (err, ans, cache) {
      if (err) {
        response = {
          status: '400',
          message: 'No Data Found',
          response: err,
        }
        res.send(response);
      } else if (ans.length > 0) {
        if (cache.isCache == false) {
          connection.flush();
        }
        var sql = "DELETE FROM post_likes  WHERE post_id=? and user_id=? ";
        connection.query(sql, [post_id, user_id], function (err, result) {
          if (err) {
            response = {
              status: '400',
              message: 'No Data Found',
              response: err,
            }
            res.send(response);
          }
          else {
            var sq2 = "select i.likes from post i where i.id=?";
            connection.query(sq2, [post_id], function (err, result, cache) {
              if (err) {
                response = {
                  status: '400',
                  message: 'No Data Found',
                  response: err,
                }
                res.send(response);
              }
              else {
                if (cache.isCache == false) {
                  connection.flush();
                }
                var likes = result[0].likes;
                if (likes != 0) {
                  likes = likes - 1;
                }
                var sq3 = "update post i set likes=? where i.id=?";
                connection.query(sq3, [likes, post_id], function (err, result) {
                  if (err) {
                    response = {
                      status: '400',
                      message: 'No Data Found',
                      response: err,
                    }
                    res.send(response);
                  }
                  else {
                    response = {
                      status: '200',
                      message: 'Dislike Updated',
                      "like_count": likes
                    }
                    res.send(response);
                  }
                });
              }
            });
          }
        });
      } else {
        response = {
          status: '400',
          message: 'Y0u Cannot Dislike This Post',
          response: [],
        }
        res.send(response);
      }
    });
  }
};

const getAllPostCommentpostid = (req, res, next) => {


  var sql = "SELECT p.comments AS post_comment_count, i.id as comment_id,i.post_id,i.user_id,i.comments,i.reply_id,i.comment_count, DATE_FORMAT(i.created_at,'%Y-%m-%d') AS create_at,i.created_at AS time_at FROM post_comment i JOIN post p ON p.id=i.post_id INNER JOIN users u ON u.id=i.user_id WHERE i.post_id=? AND u.is_admin='0' and u.delete_flag='0' AND i.reply_id IS NULL ORDER BY i.created_at desc";
  var response = [];
  // var user_id = req.body.user_id;

  connection.query(sql, [req.body.post_id], function (err, result, cache) {
    if (err) {
      response = {
        status: '500',
        message: 'No Data Found',
        response: err,
      }
      res.status(500).send(response);
    }
    else {

      res.status(200).send({ "status": 200, "message": "Success", "data": result });


    }
  });

};

async function getAllFamilyByUserIds(user_id) {
  return new Promise(async function (resolve, reject) {
    var sql1 = "SELECT  i.id as family_id,i.profile_name FROM family_profile AS i WHERE i.id IN( SELECT j.family_id FROM family_details AS j WHERE j.user_id=?) group BY i.id"

    connection.query(sql1, [user_id], function (err, ret, cache) {

      if (ret.length > 0) {
        if (cache.isCache == false) {
          connection.flush();
        }
        console.log(ret)
        resolve(ret)
      }
      else {
        if (cache.isCache == false) {
          connection.flush();
        }
        resolve([])
      }
    });
  });
};

async function addShowPostDetails(family_ids, post_id, is_update,is_public) {
  var i = 0;
  var column_name="";
   is_public == 1 ? column_name="family_id" : is_public==0 ?column_name="family_id" : is_public == 2 ? column_name="group_id" : column_name = "individual_id"
  if (is_update == true) {
    return new Promise(async function (resolve, reject) {
      var sql = "UPDATE show_post SET is_delete='1' WHERE post_id=?";

      connection.query(sql, [post_id], async function (err, results) {
        if (err) {
          response = {
            status: '400',
            response: err
          }
          resolve(response);
        }
        else {

         await family_ids.forEach((vals) => {
            var sql = "INSERT INTO show_post(post_id,"+column_name+") values ?";
            var VALUES = [[post_id, vals],];
            connection.query(sql, [VALUES], async function (err, result) {
              i++;
            });

           resolve(true)

          })
        }
      })
    })
  }
  else {
    return new Promise(async function (resolve, reject) {
      console.log(family_ids,"1")
     await family_ids.forEach((vals) => {
      console.log(vals,"2")
        var sql = "INSERT INTO show_post(post_id,"+column_name+") values ?";
        var VALUES = [[post_id, vals],];
        connection.query(sql, [VALUES], async function (err, result) {
         
        });


      })
     
       resolve(true)
    });
    
  }
};




const getAllFamilyByUserId = (req, res, next) => {
  var user_id = req.body.user_id;

  getAllFamilyByUserIds(user_id).then((members) => {
    members   =  members.map((r) => {r.isChecked=false;return r})

    res.send({
      status: "200",
      message: "Data Found",
      response: members
    });
  }
  )
}





module.exports = {
  postsUpload,
  updateposts,
  getAllPostuserid,
  likepost,
  deletepostbyid,
  CommentPost, Test,
  getAllPostCommentpostid,
  getAllFamilyByUserId,

};

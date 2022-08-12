var connection = require("../../config/db");
var storage_type = require("../../config/strorage");

var md5 = require("md5");
const moment = require("moment");

const config = require("./../../config/auth.config");

require("dotenv").config();
const DateTime = require("node-datetime/src/datetime");
var sendpushnotification = require("./push_notification/notification_fcm");

async function read_notification(notification_id) {
  return new Promise(async function (resolve, reject) {
    var sql = "select * from notification where id=? and status='0'";
    connection.query(sql, [notification_id], function (err, result, cache) {
      if (err) {
        resolve(false);
      } else if (result.length > 0) {
        if (cache.isCache == false) {
          connection.flush();
        }

        var sql1 =
          "update notification set status='1' where id=? and status='0'";
        connection.query(sql1, [notification_id], function (err, result1) {
          if (err) {
            resolve(false);
          } else if (result1.affectedRows > 0) {
            resolve(true);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
}

async function invite_insert_member(
  phone,
  user_name,
  gender,
  family_id,
  relatives,
  node_id,
  family_owner,
  fcm_token,
  insert_id
) {
  return new Promise(async function (resolve, reject) {
    var mid = null;
    var fid = null;
    var pids = null;

    let image_name = null;

    console.log(pids);
    var name = user_name;
    // var gender=gender;

    var dob = null;

    var sql3 = "select id,gender,name from family_details where id =?";
    connection.query(sql3, [node_id], function (err, result5) {
      if (err) {
        console.log("err", err);
      } else if (result5.length > 0) {
        if (relatives == "siblings") {
          var sql3 = "select * from family_details where id =?";
          connection.query(sql3, [node_id], function (err, result2) {
            if (err) {
              console.log("err", err);
              resolve(false);
            } else if (result2.length > 0) {
              console.log(result2[0].gender);
              fid = result2[0].fid;

              mid = result2[0].mid;
              var sql1 =
                "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile,is_invite,user_id) values ?";
              var VALUES = [
                [
                  mid,
                  fid,
                  name,
                  gender,
                  phone,
                  dob,
                  family_id,
                  pids,
                  image_name,
                  "1",
                  insert_id,
                ],
              ];
              connection.query(
                sql1,
                [VALUES],
                async function (err, result1sss) {
                  if (err) {
                    console.log("err", err);
                    resolve(false);
                  } else if (result1sss.affectedRows > 0) {
                    await sendpushnotification.sendInviteSignupMembernotification(
                      user_name,
                      family_id,
                      relatives,
                      family_owner,
                      fcm_token,
                      result5[0].name,
                      result1sss.insertId,
                      insert_id
                    );
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                }
              );
            }
          });
        }

        if (relatives == "child") {
          var sql3 = "select id,gender from family_details where pids =?";
          connection.query(sql3, [node_id], function (err, result2) {
            if (err) {
              console.log("err", err);
            } else if (result2.length > 0) {
              console.log(result2[0].gender);
              if (result2[0].gender == 1) {
                fid = result2[0].id;
                mid = node_id;
              } else if (result2[0].gender == 2) {
                console.log(result2[0].id);
                mid = result2[0].id;
                fid = node_id;
                console.log(mid);
              }
              var sql1 =
                "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile,is_invite,user_id) values ?";
              var VALUES = [
                [
                  mid,
                  fid,
                  name,
                  gender,
                  phone,
                  dob,
                  family_id,
                  pids,
                  image_name,
                  "1",
                  insert_id,
                ],
              ];
              connection.query(
                sql1,
                [VALUES],
                async function (err, result1sss) {
                  if (err) {
                    console.log("err", err);
                  } else if (result1sss.affectedRows > 0) {
                    resolve(true);
                    await sendpushnotification.sendInviteSignupMembernotification(
                      user_name,
                      family_id,
                      relatives,
                      family_owner,
                      fcm_token,
                      result5[0].name,
                      result1sss.insertId,
                      insert_id
                    );
                  } else {
                    resolve(false);
                  }
                }
              );
            }
          });
        }

        if (relatives == "spouse") {
          var sql1 =
            "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile,is_invite,user_id) values ?";
          var VALUES = [
            [
              mid,
              fid,
              name,
              gender,
              phone,
              dob,
              family_id,
              node_id,
              image_name,
              "1",
              insert_id,
            ],
          ];
          connection.query(sql1, [VALUES], async function (err, result1sss) {
            if (err) {
              console.log("err", err);
            } else {
              var sql5 = "select pids from  family_details where id =?";
              connection.query(sql5, [node_id], async function (err, resq) {
                if (err) {
                  console.log(err, "err");
                }
                console.log(result1sss.insertId, "insertid");
                if (resq.length > 0) {
                  var sq5 = "update family_details set pids=? where id =?";
                  connection.query(
                    sq5,
                    [result1sss.insertId, node_id],
                    function (err, res2) {
                      if (err) {
                        console.log(err, "err");
                      } else if (res2.affectedRows > 0) {
                        resolve(true);
                      } else {
                        resolve(false);
                      }
                    }
                  );
                }
              });

              await sendpushnotification.sendInviteSignupMembernotification(
                user_name,
                family_id,
                relatives,
                family_owner,
                fcm_token,
                result5[0].name,
                result1sss.insertId,
                insert_id
              );
            }
          });
        }

        if (relatives == "parent") {
          var sql1 =
            "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile,is_invite,user_id) values ?";
          var VALUES = [
            [
              mid,
              fid,
              name,
              gender,
              phone,
              dob,
              family_id,
              pids,
              image_name,
              "1",
              insert_id,
            ],
          ];
          connection.query(sql1, [VALUES], async function (err, result1sss) {
            if (err) {
              console.log("err", err);
            } else {
              if (gender == 1) {
                var sql2 = "update family_details set fid=? where id=?";

                connection.query(
                  sql2,
                  [result1sss.insertId, node_id],
                  function (err, result3) {
                    if (err) {
                      console.log(err, "err");
                    } else if (result3.affectedRows > 0) {
                      resolve(true);
                    } else {
                      resolve(false);
                    }
                  }
                );
              } else if (gender == 2) {
                var sql2 = "update family_details set mid=? where id=?";

                connection.query(
                  sql2,
                  [result1sss.insertId, node_id],
                  function (err, result3) {
                    if (err) {
                      console.log(err, "err");
                    } else if (result3.affectedRows > 0) {
                      resolve(true);
                    } else {
                      resolve(false);
                    }
                  }
                );
              }
              await sendpushnotification.sendInviteSignupMembernotification(
                user_name,
                family_id,
                relatives,
                family_owner,
                fcm_token,
                result5[0].name,
                result1sss.insertId,
                insert_id
              );
            }
          });
        }
      } else {
        resolve(false);
      }
    });
  });
}

const insert_data = (req, res, next) => {
  var mid = null;
  var fid = null;
  var pids = null;
  if (req.body.mid) {
    mid = req.body.mid;
  }
  if (req.body.fid) {
    fid = req.body.fid;
  }
  if (req.body.pids) {
    pids = req.body.pids;
  }
  let image_name = null;
  if (req.files) {
    let image = req.files.profile;

    image.mv(
      "./public/uploads/" + moment().utc().format("YYYYMMDDHHmmss") + image.name
    );
    image_name = moment().utc().format("YYYYMMDDHHmmss") + image.name;

    file = "./public/uploads/" + image_name;
  }
  console.log(image_name, "image");

  console.log(pids);
  var name = req.body.name;
  var gender = req.body.gender;

  var dob = req.body.dob;
  var phone = req.body.phone;
  console.log(fid);

  console.log(name);
  console.log(gender);

  if (req.body.relatives == "child") {
    var sql3 = "select id,gender from family_details where pids =?";
    connection.query(sql3, [req.body.nodeId], function (err, result2) {
      if (err) {
        console.log("err", err);
        res.send({
          message: "err",
        });
      } else if (result2.length > 0) {
        console.log(result2[0].gender);
        if (result2[0].gender == 1) {
          if (req.body.fid == "" || "") {
            fid = result2[0].id;
          }
        } else if (result2[0].gender == 2) {
          if (req.body.mid == "" || "") {
            console.log(result2[0].id);
            mid = result2[0].id;
            console.log(mid);
          }
        }
        var sql1 =
          "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile) values ?";
        var VALUES = [
          [
            mid,
            fid,
            name,
            gender,
            phone,
            dob,
            req.body.family_id,
            pids,
            image_name,
          ],
        ];
        connection.query(sql1, [VALUES], function (err, result1sss) {
          if (err) {
            console.log("err", err);
            res.send({
              message: "err",
            });
          } else {
            res.send({
              message: "success",
              data: [],
              status: 200,
            });
          }
        });
      }
    });
  }
  console.log(mid, "hi");

  if (req.body.relatives == "spouse") {
    var sql1 =
      "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile) values ?";
    var VALUES = [
      [
        mid,
        fid,
        name,
        gender,
        phone,
        dob,
        req.body.family_id,
        pids,
        image_name,
      ],
    ];
    connection.query(sql1, [VALUES], function (err, result1sss) {
      if (err) {
        console.log("err", err);
        res.send({
          message: "err",
        });
      } else {
        var sql5 = "select pids,gender from  family_details where id =?";
        connection.query(sql5, [req.body.nodeId], function (err, resq) {
          if (err) {
            res.send({
              message: "err",
              data: [],
              status: 400,
            });
          }
          console.log(result1sss.insertId, "insertid");
          if (resq.length > 0) {
            var sq5 = "update family_details set pids=? where id =?";
            connection.query(
              sq5,
              [result1sss.insertId, req.body.nodeId],
              function (err, res2) {
                if (err) {
                  res.send({
                    message: "error",
                    data: [],
                    status: "400",
                  });
                } else if (res2.affectedRows > 0) {
                  var obj = "";
                  if (resq[0].gender == "1") {
                    obj = "fid";
                  } else if (resq[0].gender == "2") {
                    obj = "mid";
                  }
                  var sql53 =
                    "select * from  family_details where " + obj + "=?";
                  connection.query(
                    sql53,
                    [req.body.nodeId],
                    function (err, res2) {
                      if (err) {
                        res.send({
                          message: "err",
                          data: [],
                          status: 400,
                        });
                      } else {
                        if (obj == "fid") {
                          obj = "mid";
                        } else if (obj == "mid") {
                          obj = "fid";
                        }
                        for (let i = 0; i < res2.length; i++) {
                          var sq52 =
                            "update family_details set " +
                            obj +
                            "=? where id =?";
                          connection.query(
                            sq52,
                            [result1sss.insertId, res2[i].id],
                            function (err, res4) {
                              if (err) {
                                res.send({
                                  message: "error",
                                  data: [],
                                  status: "400",
                                });
                              } else if (res4.affectedRows > 0) {
                                console.log("success affected");
                              }
                            }
                          );
                        }

                        res.send({
                          message: "Inserted successfully",
                          data: [],
                          status: 200,
                        });
                      }
                    }
                  );
                } else {
                  res.send({
                    message: " Not Inserted ",
                    data: [],
                    status: 400,
                  });
                }
              }
            );
          }
          // }
        });
      }
    });
  }

  if (req.body.relatives == "parent") {
    var sql1 =
      "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile) values ?";
    var VALUES = [
      [
        mid,
        fid,
        name,
        gender,
        phone,
        dob,
        req.body.family_id,
        pids,
        image_name,
      ],
    ];
    connection.query(sql1, [VALUES], function (err, result1sss) {
      if (err) {
        console.log("err", err);
        res.send({
          message: "err",
          status: 400,
          data: [],
        });
      } else {
        if (gender == 1) {
          var sql2 = "update family_details set fid=? where id=?";

          connection.query(
            sql2,
            [result1sss.insertId, req.body.nodeId],
            function (err, result3) {
              if (err) {
                res.send({
                  message: "err",
                  status: 400,
                  data: [],
                });
              } else {
                res.send({
                  message: "success",
                  status: 200,
                  data: [],
                });
              }
            }
          );
        } else if (gender == 2) {
          var sql2 = "update family_details set mid=? where id=?";

          connection.query(
            sql2,
            [result1sss.insertId, req.body.nodeId],
            function (err, result3) {
              if (err) {
                res.send({
                  message: "err",
                  status: 400,
                  data: [],
                });
              } else {
                res.send({
                  message: "success",
                  status: 200,
                  data: [],
                });
              }
            }
          );
        }
      }
    });
  }

  if (req.body.relatives == "siblings") {
    var sql3 = "select * from family_details where id =?";
    connection.query(sql3, [req.body.nodeId], function (err, result2) {
      if (err) {
        console.log("err", err);
        res.send({
          message: "err",
        });
      } else if (result2.length > 0) {
        console.log(result2[0].gender);
        fid = result2[0].fid;

        mid = result2[0].mid;
        var sql1 =
          "insert into family_details (mid,fid,name,gender,phone,dob,family_id,pids,profile) values ?";
        var VALUES = [
          [
            mid,
            fid,
            name,
            gender,
            phone,
            dob,
            req.body.family_id,
            pids,
            image_name,
          ],
        ];
        connection.query(sql1, [VALUES], function (err, result1sss) {
          if (err) {
            console.log("err", err);
            res.send({
              message: "err",
            });
          } else if (result1sss.affectedRows > 0) {
            res.send({
              message: "Inserted Successfully..!",
              data: [],
              status: 200,
            });
          } else {
            res.send({
              message: "Not Inserted..!",
              data: [],
              status: 400,
            });
          }
        });
      }
    });
  }
};

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

const get_data = (req, res, next) => {
  var start = new Date().getTime();
  var chat_flag = true;
  var response = [];

  var sql1 = "";
  var owner = false;

  var sql5 = "SELECT * FROM family_profile WHERE id=? AND family_owner=?";

  connection.query(
    sql5,
    [req.body.family_id, req.body.user_id],
    function (err, result1h, cache) {
      if (err) {
        console.log("err", err);
        res.send({
          message: "err",
          data: [],
          status: 400,
        });
      } else if (result1h.length > 0) {
        console.log(result1h.length, "1");
        if (cache.isCache == false) {
          connection.flush();
        }
        owner = true;
        sql1 =
          "SELECT fd.*,fp.profile_name,fd.user_id,fp.family_owner,fd.parent FROM family_details  fd JOIN family_profile fp ON fp.id=fd.family_id WHERE fd.family_id=" +
          req.body.family_id +
          " and fd.is_invite in ('0','1')";
      } else {
        sql1 =
          "SELECT fd.*,fp.profile_name,fd.user_id,fp.family_owner,fd.parent FROM family_details  fd JOIN family_profile fp ON fp.id=fd.family_id WHERE fd.family_id=" +
          req.body.family_id +
          " and fd.is_invite in ('0')";
      }

      connection.query(sql1, async function (err, result1sss, cache) {
        if (err) {
          console.log("err", err);
          res.send({
            message: "err",
            data: [],
            status: 400,
          });
        } else if (result1sss.length > 0) {
          if (cache.isCache == false) {
            connection.flush();
          }

          console.log(result1sss.length);
          var json = [];
          var response = [];
          var family_length = result1sss.length;
          var sql51 =
            "SELECT id FROM family_details WHERE family_id=? and is_invite='1'";

          connection.query(
            sql51,
            [req.body.family_id],
            function (err, result1ha, cache) {
              if (err) {
                console.log("err", err);
                res.send({
                  message: "err",
                  data: [],
                  status: 400,
                });
              } else if (result1ha.length > 0 && owner === false) {
                if (cache.isCache == false) {
                  connection.flush();
                }

                var arr = [];
                for (let i = 0; i < result1ha.length; i++) {
                  arr.push(result1ha[i].id);
                }
                console.log(arr, "arr");
                result1sss.forEach(async (presult, pindex) => {
                  var pids = "";

                  var gender = "";
                  if (presult.gender == 1) {
                    gender = "male";
                  } else if (presult.gender == 2) {
                    gender = "female";
                  }

                  console.log(presult.pids, "h");
                  var hi = "";
                  var pids = "";

                  if (presult.pids != null) {
                    var ps = "";
                    ps = arr.includes(presult.pids) ? null : presult.pids;
                    pids = [ps];
                  } else {
                    pids = null;
                  }
                  chat_flag =
                    presult.user_id == null || presult.user_id == 0
                      ? false
                      : true;
                  chat_flag =
                    presult.user_id == req.body.user_id ? false : true;

                    if(presult.parent=='1'){
                      response.push({
                        pids: pids,
                        mid: arr.includes(presult.mid) ? null : presult.mid,
                        fid: arr.includes(presult.fid) ? null : presult.fid,
                        name: presult.name,
                        gender: gender,
                        dob: presult.dob,
                        phone: presult.phone,
                        famliy_id: presult.family_id,
                        id: presult.id,
                        profile: presult.profile,
                        family_owner: presult.family_owner,
                        family_name: presult.profile_name,
                        first_node: family_length > 1 ? false : true,
                        user_id: presult.user_id,
                        chat_flag: chat_flag,
                      });
                    }else{
                      response.push({
                        pids: pids,
                        mid: arr.includes(presult.mid) ? null : presult.mid,
                        fid: arr.includes(presult.fid) ? null : presult.fid,
                        name: presult.name,
                        gender: gender,
                        dob: presult.dob,
                        phone: presult.phone,
                        famliy_id: presult.family_id,
                        id: presult.id,
                        profile: presult.profile,
                        family_owner: presult.family_owner,
                        family_name: presult.profile_name,
                        first_node: family_length > 1 ? false : true,
                        user_id: presult.user_id,
                        chat_flag: chat_flag,
                        tags:["overrideMenu"]
                      });
                    }
                
                  console.log(response.length);
                  result1sss.length == response.length &&
                    res.send({
                      status: 200,
                      message: "Success",
                      data: response,
                      start_time: start,
                      end_time: new Date().getTime(),
                      execution_time_ms: new Date().getTime() - start,
                      execution_time_s: (new Date().getTime() - start) / 1000,
                    });
                });
              } else {
                result1sss.forEach(async (presult, pindex) => {
                  var pids = "";
                  var pids1 = "";
                  var someStr = "";
                  var gender = "";
                  if (presult.gender == 1) {
                    gender = "male";
                  } else if (presult.gender == 2) {
                    gender = "female";
                  }

                  console.log(presult.pids, "h");
                  var hi = "";
                  var pids = "";
                  if (presult.pids != null) {
                    pids = [presult.pids];
                  } else {
                    pids = null;
                  }
                  chat_flag =
                    presult.user_id == null || presult.user_id == 0
                      ? false
                      : true;
                  chat_flag =
                    presult.user_id == req.body.user_id ? false : true;
                    if(presult.parent=='1'){
                  response.push({
                    pids: pids,
                    mid: presult.mid,
                    fid: presult.fid,
                    name: presult.name,
                    gender: gender,
                    dob: presult.dob,
                    phone: presult.phone,
                    famliy_id: presult.family_id,
                    id: presult.id,
                    profile: presult.profile,
                    family_owner: presult.family_owner,
                    family_name: presult.profile_name,
                    first_node: family_length > 1 ? false : true,
                    user_id: presult.user_id,
                    chat_flag: chat_flag,                    
                  });
                }else{
                  response.push({
                    pids: pids,
                    mid: presult.mid,
                    fid: presult.fid,
                    name: presult.name,
                    gender: gender,
                    dob: presult.dob,
                    phone: presult.phone,
                    famliy_id: presult.family_id,
                    id: presult.id,
                    profile: presult.profile,
                    family_owner: presult.family_owner,
                    family_name: presult.profile_name,
                    first_node: family_length > 1 ? false : true,
                    user_id: presult.user_id,
                    chat_flag: chat_flag,
                    tags:["overrideMenu"]
                  });
                }
                  console.log(response.length);
                  result1sss.length == response.length &&
                    res.send({
                      status: 200,
                      message: "Success",
                      data: response,
                      start_time: start,
                      end_time: new Date().getTime(),
                      execution_time_ms: new Date().getTime() - start,
                      execution_time_s: (new Date().getTime() - start) / 1000,
                    });
                });
              }
            }
          );
        } else {
          console.log(result1sss.length);
          res.send({
            message: "no data",
            data: [],
            status: 400,
          });
        }
      });
    }
  );
};

const get_byid = (req, res, next) => {
  var response = [];
  var sql1 = "select * from family_details where id=? ";

  connection.query(sql1, [req.body.id], function (err, result, cache) {
    if (err) {
      console.log("err", err);
      res.send({
        message: "err",
      });
    } else if (result.length > 0) {
      if (cache.isCache == false) {
        connection.flush();
      }

      res.send({
        message: "success",
        data: result,
      });
    } else {
      res.send({
        message: "no data",
      });
    }
  });
};

const user_signup = async (req, res) => {
  var family_id = req.body.family_id;
  var relatives = req.body.relatives;
  var fcm_token = req.body.fcm_token;
  var user_name = req.body.user_name.toString().trim();
  if (req.body.link == "1") {
    family_id = req.body.family_id;
  } else {
    family_id = 0;
  }

  var gender = req.body.gender;
  var user_profile;
  if (gender == 1) {
    user_profile = process.env.profile_men_image;
  } else if (gender == 2) {
    user_profile = process.env.profile_women_image;
  } else if (gender == 3) {
    user_profile = process.env.profile_not_specified;
  }

  var sql = "select * from users where phone=?";
  connection.query(sql, [req.body.phone], async function (err, result, cache) {
    if (err) {
      res.send({
        status: 400,
        message: "error1",
        data: [],
      });
    }
    if (cache.isCache == false) {
      connection.flush();
    }
    console.log(result.length);

    if (result.length > 0) {
      res.send({
        status: 400,
        message: "User is already registered..!",
        data: [],
      });
    } else if (result.length == 0) {
      var sql = "select * from users where user_name=?";
      connection.query(sql, [user_name], async function (err, results, cache) {
        if (err) {
          res.send({
            status: 400,
            message: "error2",
            data: [],
          });
        } else if (results.length > 0) {
          if (cache.isCache == false) {
            connection.flush();
          }
          res.send({
            status: 400,
            message: "Username is already exist.!",
            data: [],
          });
        } else {
          var password = md5(req.body.password);
          var sql1 =
            "insert into users (user_name,password,gender,family_id,phone,email_id,status,fcm_token,user_profile) values ? ";
          var VALUES = [
            [
              user_name,
              password,
              req.body.gender,
              family_id,
              req.body.phone,
              req.body.email_id,
              "0",
              fcm_token,
              user_profile,
            ],
          ];
          connection.query(
            sql1,
            [VALUES],
            async function (err, result1, cache) {
              if (err) {
                res.send({
                  status: 400,
                  message: "error3",
                  data: [],
                });
              } else if (result1.affectedRows > 0) {
                var sql1 =
                  "SELECT fp.*,u.phone,u.fcm_token FROM family_profile fp JOIN users u ON u.id=fp.family_owner WHERE fp.id=? AND fp.status='0'";
                connection.query(
                  sql1,
                  [family_id],
                  async function (err, resultsl, cache) {
                    if (err) {
                      res.send({
                        status: 400,
                        message: "error4",
                        data: [],
                      });
                    } else {
                      if (cache.isCache == false) {
                        connection.flush();
                      }
                      if (req.body.link == "1") {
                        await invite_insert_member(
                          req.body.phone,
                          user_name,
                          req.body.gender,
                          family_id,
                          relatives,
                          req.body.node_id,
                          resultsl[0].family_owner,
                          resultsl[0].fcm_token,
                          result1.insertId
                        );
                        res.send({
                          status: 200,
                          message: "User Registered successfully",
                          data: [],
                          family_status: req.body.link == "1" ? "1" : "0",
                          user_id: result1.insertId,
                        });
                      } else {
                        res.send({
                          status: 200,
                          message: "User Registered successfully",
                          data: [],
                          family_status: req.body.link == "1" ? "1" : "0",
                          user_id: result1.insertId,
                        });
                      }
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });
};

const user_login = (req, res) => {
  var password = md5(req.body.password);
  var sql = "select * from users where user_name=? and status='0' ";
  connection.query(
    sql,
    [req.body.user_name],
    async function (err, result, cache) {
      if (err) {
        res.send({
          status: "400",
          message: "error",
          data: [],
        });
      } else if (result.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(result.length, "len");
        if (cache.isCache == false) {
          connection.flush();
        }

        if (password == result[0].password) {
          res.send({
            status: 200,
            message: "User login successfully..!",
            data: result,
            family_status: "1",
            user_id: result[0].id,
            family_id: result[0].family_id,
          });
        } else {
          res.send({
            status: 400,
            message: "Username and Password are mismatch..!",
            data: [],
          });
        }
      } else {
        console.log(result.length, "len2");
        res.send({
          status: 400,
          message: "User does not exist..!",
          data: [],
        });
      }
    }
  );
};

const get_gender_master = (req, res) => {
  var sql = "select * from gender";
  connection.query(sql, function (err, result, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else if (result.length > 0) {
      if (cache.isCache == false) {
        connection.flush();
      }
      res.send({
        message: "Data found succesfully",
        data: result,
        status: 200,
      });
    } else {
      res.send({
        data: [],
        status: 400,
        message: "No data found",
      });
    }
  });
};

const save_nodeid = (req, res) => {
  var sql = "select * from node_id_save";
  connection.query(sql, function (err, result, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else if (result.length > 0) {
      if (cache.isCache == false) {
        connection.flush();
      }
      console.log(result);

      var sql1 = "update node_id_save set nodeid=? where id=?";
      connection.query(
        sql1,
        [req.body.nodeid, result[0].id],
        function (err, result1, cache) {
          if (err) {
            res.send({
              message: "error",
              status: 400,
              data: [],
            });
          } else {
            res.send({
              message: "updated successfully",
              status: 200,
              data: [],
            });
          }
        }
      );
    } else {
      var sql2 = "insert into  node_id_save (nodeid) values ?";
      var VALUES = [[req.body.nodeid]];
      connection.query(sql2, [VALUES], function (err, result2, cache) {
        if (err) {
          res.send({
            message: "error",
            status: 400,
            data: [],
          });
        } else {
          res.send({
            message: "Inserted successfully",
            status: 200,
            data: [],
          });
        }
      });
    }
  });
};

const get_nodeid = (req, res) => {
  var sql =
    "SELECT ns.nodeid,fd.gender FROM node_id_save ns INNER JOIN family_details fd ON fd.id=ns.nodeid";
  connection.query(sql, function (err, result, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else if (result.length > 0) {
      if (cache.isCache == false) {
        connection.flush();
      }
      res.send({
        message: "Data found succesfully",
        data: result,
        status: 200,
      });
    } else {
      res.send({
        data: [],
        status: 400,
        message: "No data found",
      });
    }
  });
};

const get_relatives = (req, res) => {
  var sql = "select * from relatives";
  connection.query(sql, function (err, result, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else if (result.length > 0) {
      if (cache.isCache == false) {
        connection.flush();
      }
      res.send({
        message: "Data found succesfully",
        data: result,
        status: 200,
      });
    } else {
      res.send({
        data: [],
        status: 400,
        message: "No data found",
      });
    }
  });
};

const insert_family_profile = (req, res) => {
  var sql = "insert into family_profile  (profile_name,family_owner) values ?";
  var VALUES = [[req.body.profile_name, req.body.user_id]];
  connection.query(sql, [VALUES], function (err, result, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else {
      var ql1 = "select * from users where id=? and status='0'";

      connection.query(ql1, [req.body.user_id], function (err, result1, cache) {
        if (err) {
          res.send({
            message: "error",
            status: 400,
            data: [],
          });
        } else if (result1.length > 0) {
          if (cache.isCache == false) {
            connection.flush();
          }

          var sql1 =
            "insert into family_details  (name,gender,family_id,phone,user_id,parent) values ?";
          var VALUES = [
            [
              result1[0].user_name,
              result1[0].gender,
              result.insertId,
              result1[0].gender,
              req.body.user_id,
              '0'
            ],
          ];
          connection.query(sql1, [VALUES], function (err, result2, cache) {
            if (err) {
              res.send({
                message: "error",
                status: 400,
                data: [],
              });
            } else {
              var sql2 =
                "update users set family_id=? where id=? and status='0'";
              connection.query(
                sql2,
                [result.insertId, req.body.user_id],
                function (err, result3, cache) {
                  if (err) {
                    res.send({
                      message: "error",
                      status: 400,
                      data: [],
                    });
                  } else if (result3.affectedRows > 0) {
                    res.send({
                      message: "Data inserted succesfully",
                      data: [],
                      status: 200,
                      family_id: result.insertId,
                      family_status: "1",
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
  });
};

const invite_acceptance = async (req, res) => {
  if (req.body.accepted == "1") {
    var sql2 = "UPDATE family_details SET is_invite=? WHERE id=?";
    connection.query(
      sql2,
      ["0", req.body.node_id],
      async function (err, result3, cache) {
        if (err) {
          res.send({
            message: "error",
            status: 400,
            data: [],
          });
        } else if (result3.affectedRows > 0) {
          const send = await read_notification(req.body.notification_id);
          if (send) {
            await sendpushnotification.sendInviteAcceptSignupMembernotification(
              req.body.notification_id
            );
            res.send({
              message: "Data updated succesfully",
              data: [],
              status: 200,
            });
          }
        } else {
          res.send({
            message: "Not updated..!",
            data: [],
            status: 400,
          });
        }
      }
    );
  } else if ((req.body.accepted = "2")) {
  }
};

const get_notifications = (req, res) => {
  var sql2 = "select *  from notification where own_id=? and status='0'";
  connection.query(sql2, [req.body.own_id], function (err, result3, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else if (result3.length > 0) {
      if (cache.isCache == false) {
        connection.flush();
      }
      res.send({
        message: "Data Found..!",
        data: result3,
        status: 200,
      });
    } else {
      res.send({
        message: "Date Not found..!",
        data: [],
        status: 400,
      });
    }
  });
};

const read_notifications = async (req, res) => {
  const send = await read_notification(req.body.notification_id);
  if (send) {
    res.send({
      status: 200,
      data: [],
      message: "Notification gets readed",
    });
  } else {
    res.send({
      status: 400,
      data: [],
      message: "Notification not readed",
    });
  }
};

const getUserIdByNodeId = async (req, res) => {
  var sql2 =
    "INSERT IGNORE  INTO temp_chat (own_id,user_id)  SELECT '?',user_id FROM family_details WHERE id='?' ON DUPLICATE KEY UPDATE  user_id=(SELECT user_id FROM family_details WHERE id='?')";
  connection.query(
    sql2,
    [req.body.user_id, req.body.node_id, req.body.node_id],
    function (err, result3, cache) {
      if (err) {
        res.send({
          message: "error",
          status: 400,
          data: [],
        });
      } else {
        res.send({
          status: 200,
          message: result3,
        });
      }
    }
  );
};

const getChatUserDetailsById = async (req, res) => {
  var sql2 =
    "SELECT i.user_id,u.user_name,u.fcm_token  FROM temp_chat i  join users u ON i.user_id=u.id WHERE i.own_id=? ";
  connection.query(sql2, [req.body.user_id], function (err, result3, cache) {
    if (err) {
      res.send({
        message: "error",
        status: 400,
        data: [],
      });
    } else {
      var sql2 = "delete from temp_chat where own_id =?";
      connection.query(sql2, [req.body.user_id], function (err, result, cache) {
        if (err) {
          res.send({
            message: "error",
            status: 400,
            data: [],
          });
        } else {
          res.send({
            status: 200,
            message: result3,
          });
        }
      });
    }
  });
};

module.exports = {
  insert_data,
  get_data,
  get_byid,
  user_signup,
  user_login,
  get_gender_master,
  save_nodeid,
  get_nodeid,
  get_relatives,
  insert_family_profile,
  invite_acceptance,
  get_notifications,
  read_notifications,
  getUserIdByNodeId,
  getChatUserDetailsById,
};

var storage = require("../commonservies/storage.controller");
var connection = require("../../config/db");
const moment = require('moment');


const createorupdategroup = (req, res, next) => {
    var response = [];
    var group_title = req.body.group_title;
    var description = req.body.description || '';
    var user_id = req.body.own_id;
    var members_id = req.body.members_id;
    var group_id = req.body.group_id || null;
    console.log(group_id)
    if (group_id != null) {
        var sql = "update `group` set group_title=?,description=? where id=? ";
        connection.query(sql, [group_title, description, group_id], function (err, result, cache) {
            if (err) {
                response = {
                    status: '400',
                    message: 'No Data Found',
                    response: err,
                }
                res.status(400).send(response);
            }
            else {
                if (cache.isCache == false) {
                    connection.flush();
                }
                response = {
                    status: '200',
                    message: 'Group Updated Sucessfully',
                }
                res.status(200).send(response);
            }
        });

    }
    else {

        var sql = "insert into `group` (group_title,description,owner_id) values ?";
        var VALUES = [[group_title, description, user_id],];
        connection.query(sql, [VALUES], function (err, result, cache) {
            if (err) {
                response = {
                    status: '400',
                    message: 'No Data Found',
                    response: err,
                }
                res.status(400).send(response);
            }
            else {
                if (cache.isCache == false) {
                    connection.flush();
                }

                var sql = "insert into group_members(group_id,user_id,is_owner) values ?";
                var VALUES = [[result.insertId, user_id,'1'],];
                connection.query(sql, [VALUES], function (err, result1, cache) {
                    if (err) {
                        response = {
                            status: '400',
                            message: 'No Data Found',
                            response: err,
                        }
                        res.status(400).send(response);
                    }

                    else {
                        if (cache.isCache == false) {
                            connection.flush();
                        }
                        response = {
                            status: '200',
                            message: 'Group Created Sucessfully ',
                        }
                       res.status(200).send(response);
                    }
                });

            }
        });

    };
};

const addmemberingroup = (req, res, next) => {


    var response = [];
    var own_id = req.body.own_id;
    var group_id = req.body.group_id;


    var sql = "select owner_id from `group`  where id=?";
    connection.query(sql, [group_id], function (err, own, cache) {
        if (err) {
            response = {
                status: '400',
                message: 'No Data Found',
                response: err,
            }
            res.status(400).send(response);
        }
        else {
            if (cache.isCache == false) {
                connection.flush();
            }
            if (own.length > 0) {
                if (own[0].owner_id == own_id) {
                    if (req.body.members_id.length > 0) {
                        req.body.members_id.forEach((vals, pindex) => {
                            var sql = "select * from group_members where group_id=? and user_id =?";
                            connection.query(sql, [group_id, vals], function (err, results, cache) {
                                if (err) {
                                    response = {
                                        status: '400',
                                        message: 'No Data Found',
                                        response: err,
                                    }
                                    res.status(400).send(response);
                                }
                                else {
                                    if (results.length > 0) {
                                        if (cache.isCache == false) {
                                            connection.flush();
                                        }
                                        response = {
                                            status: '200',
                                            message: 'Members Added Succesfully',
                                        }
                                        pindex == req.body.members_id.length - 1 && res.status(200).send(response);

                                    }
                                    else {
                                        var sql = "insert into group_members(group_id,user_id,is_owner) values ?";
                                        var VALUES = [[group_id, vals,'0'],];
                                        connection.query(sql, [VALUES], function (err, result, cache) {
                                            if (err) {
                                                response = {
                                                    status: '400',
                                                    message: 'No Data Found',
                                                    response: err,
                                                }
                                                res.status(400).send(response);
                                            }
                                            else {
                                                if (cache.isCache == false) {
                                                    connection.flush();
                                                }
                                                response = {
                                                    status: '200',
                                                    message: 'Members Added Succesfully',
                                                }
                                                pindex == req.body.members_id.length - 1 && res.status(200).send(response);
                                            }
                                        });

                                    }
                                }
                            });

                        });
                    }
                    else {
                        response = {
                            status: '200',
                            message: 'Members Added Succesfully',
                        }
                        res.status(200).send(response);
                    }
                }
                else {
                    response = {
                        status: '400',
                        message: "You can't add the user",
                    }
                    res.status(200).send(response);
                }
            } else {
                response = {
                    status: '400',
                    message: "No Group Found",
                }
                res.status(200).send(response);
            }

        }
    });
}

const getallmembersbygroupid = (req, res, next) => {


     var sql="SELECT u.id AS user_id,u.fcm_token,u.user_name,u.user_name,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as profile_image,if(u.id=( SELECT l.owner_id FROM `group` l WHERE l.id=?),1,0 ) as owner_status   FROM users u   left JOIN `group` g ON g.owner_id =u.id LEFT JOIN group_members gp ON gp.group_id=g.id  where u.id IN (SELECT g.owner_id FROM `group` g WHERE g.id=?) OR u.id IN( SELECT gp.user_id FROM group_members gp WHERE gp.group_id=? AND gp.`status`='0') group BY u.id ";

    // var sql = "SELECT u.id AS user_id,u.user_name,u.user_name,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as profile_image,gp.is_owner as owner_status   FROM users u   left JOIN `group` g ON g.owner_id =u.id LEFT JOIN group_members gp ON gp.group_id=g.id  where u.id IN (SELECT g.owner_id FROM `group` g WHERE g.id=?) OR u.id IN( SELECT gp.user_id FROM group_members gp WHERE gp.group_id=? AND gp.`status`='0')  Group BY u.id";

    connection.query(sql, [process.env.profile_image_show_path, req.body.group_id, req.body.group_id, req.body.group_id], function (err, result, cache) {
        if (err) {
            response = {
                status: '400',
                message: 'No Data Found',
                response: err,
            }
            res.status(400).send(response);
        }
        else {
            if (cache.isCache == false) {
                connection.flush();
            }
            response = {
                status: '200',
                message: result,
            }
            res.status(200).send(response);
        }
    });
}

const removememberingroup = (req, res, next) => {
    var response = [];
    var own_id = req.body.own_id;
    var group_id = req.body.group_id;
    var user_id = req.body.user_id;
    var sql = "select owner_id from `group`  where id=?";
    connection.query(sql, [group_id], function (err, own, cache) {
        if (err) {
            response = {
                status: '400',
                message: 'No Data Found',
                response: err,
            }
            res.status(400).send(response);
        }
        else {
            if (cache.isCache == false) {
                connection.flush();
            }
            if (own[0].owner_id == own_id) {
                var sql = "delete from  group_members where group_id=? and user_id=?";
                connection.query(sql, [group_id, user_id], function (err, result, cache) {
                    if (err) {
                        response = {
                            status: '400',
                            message: 'No Data Found',
                            response: err,
                        }
                        res.status(400).send(response);
                    }
                    else {
                        if (cache.isCache == false) {
                            connection.flush();
                        }
                        response = {
                            status: '200',
                            message: 'User Remove Sucessfully',
                        }
                        res.status(200).send(response);
                    }
                });

            }
            else {
                response = {
                    status: '400',
                    message: "You can't remove the user",
                }
                res.status(400).send(response);
            }

        }
    });

};

const exitgroup = (req, res, next) => {
    var response = [];
    var user_id = req.body.user_id;
    var group_id = req.body.group_id;
    var sql = "delete from  group_members where group_id=? and user_id=?";
    connection.query(sql, [group_id, user_id], function (err, result, cache) {
        if (err) {
            response = {
                status: '400',
                message: 'No Data Found',
                response: err,
            }
            res.status(400).send(response);
        }
        else {
            if (cache.isCache == false) {
                connection.flush();
            }

            response = {
                status: '200',
                message: 'Exit Sucessfully ',
            }
            res.status(200).send(response);

        }
    });
};


const getAllGroupBYUserId = (req, res, next) => {
    var response = [];
    var user_id = req.body.user_id;

    var sql = "SELECT g.id AS group_id,g.group_title,g.description ,g.owner_id,if(g.owner_id=?,'1','0') AS owner_status  FROM `group` g  LEFT JOIN group_members k ON  k.group_id=g.id  WHERE  g.owner_id=? OR g.id IN (SELECT gp.group_id   FROM  group_members  gp WHERE gp.user_id=? AND gp.`status`='0') AND g.is_delete=0  group BY g.id";
    connection.query(sql, [user_id, user_id, user_id], function (err, result, cache) {
        if (err) {
            response = {
                status: '400',
                message: 'No Data Found',
                response: err,
            }
            res.status(400).send(response);
        }
        else {
            if (cache.isCache == false) {
                connection.flush();
            }

            response = {
                status: '200',
                message: result,
            }
            res.status(200).send(response);

        }
    });
};

async function getAllFamilyMembers(family_id, user_id, group_id) {
    return new Promise(async function (resolve, reject) {
        var sql1 = group_id == null ? "SELECT u.id AS user_id,u.user_name,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as profile_image,IF(u.id=j.family_owner,'1','0') as owner_status  FROM users u JOIN  family_details AS i ON u.id=i.user_id JOIN family_profile j ON j.id=i.family_id WHERE i.family_id=? AND i.user_id!='' AND i.user_id!=?" :
            "SELECT u.id AS user_id,u.user_name,CONCAT(?, CASE WHEN u.user_profile != '' THEN  Concat(u.user_profile) end) as profile_image,IF(u.id=j.family_owner,'1','0') as owner_status   FROM users u JOIN  family_details AS i ON u.id=i.user_id JOIN family_profile j ON j.id=i.family_id WHERE i.family_id=? AND i.user_id!='' AND i.user_id!=? AND i.user_id NOT IN (SELECT g.user_id FROM group_members g WHERE g.group_id=? and g.status='0') "

        connection.query(sql1, [process.env.profile_image_show_path, family_id, user_id, group_id], function (err, ret, cache) {

            if (ret.length > 0) {
                console.log(ret)
                ret = ret.map((r) => { r.isChecked = false; return r })
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

const getRemovedFamilyMembers = async (req, res, next) => {
    var remove_ids = req.body.remove_ids;
    var group_id = req.body.group_id;

    getAllFamilyMembers(req.body.family_id, req.body.user_id, group_id).then((members) => {

        members = members.map((r) => {
            remove_ids.includes(r.user_id) ? r.isChecked = true : r.isChecked = false; return r;
        })
        res.send({
            status: "200",
            message: "Data Found",
            response: members
        });
    })

}

module.exports = { createorupdategroup, addmemberingroup, getallmembersbygroupid, removememberingroup, exitgroup, getAllGroupBYUserId, getRemovedFamilyMembers };
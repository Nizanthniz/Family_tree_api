var serverKey = 'AAAAwBcxwo0:APA91bFaV4Ox3jG-q1yzdtbfZppyylcsTwmJWhd-_oZxr6lfSWMKJ3HCIW8pCiRkGjA681-GipUnW3L8ciBHlIqcvBF6VO52NUJrAY8yewbSSidtP-64aOHsz2bk7I-Ga2wXu6C7UeOg';
var FCm = require('fcm-push');
const { resolve } = require('path');
var connection = require('../../../config/db');

var fcm = new FCm(serverKey);

async function sendInviteSignupMembernotification(user_name, family_id, relatives, family_owner, fcm_token, node_id_name, user_id, insert_id) {

    var message = user_name + " wants to join your family as a " + relatives + " for " + node_id_name


    var sql1 = "insert into notification (own_id,user_id,message,family_id,users_own_id,type) values ?";
    var VALUES = [[family_owner, user_id, message, family_id, insert_id, '2'],]
    connection.query(sql1, [VALUES], function (err, result) {
        if (err) {
            console.log(err)
        } else if (result.affectedRows > 0) {
            var sql1 = "SELECT COUNT(*) as count FROM notification i WHERE i.own_id=? AND i.`status`='0'";

            connection.query(sql1, [family_owner], function (err, count) {
                if (err) {
                    console.log(err)
                } else if (count.length > 0) {


                    console.log(fcm_token)
                    const message = {
                        to: fcm_token,
                        notification: {
                            title: 'Family Tree',
                            body: user_name + " wants to join your family as a " + relatives + " for " + node_id_name,
                            notification_count: count[0].count
                        },
                        data: {
                            "node_id": user_id,
                            "family_id": family_id,
                            "notification_count": count[0].count
                        }

                    };
                    fcm.send(message, function (err, response) {
                        if (err) {
                            console.log("Something has gone wrong!" + err);
                            console.log("Response:! " + response);
                        } else {
                            //showToast("Successfully sent with response");
                            console.log("Successfully sent with response: ", response);

                        }

                    });
                }
            });
        }



        else {
            console.log("not inserted")
        }

    });

}


async function sendInviteAcceptSignupMembernotification(notification_id) {



    var sql1 = "SELECT n.id,n.family_id,n.users_own_id,u.fcm_token,u1.user_name,fp.profile_name FROM notification n JOIN users u ON u.id=n.users_own_id JOIN family_profile fp ON fp.id=n.family_id JOIN users u1 ON u1.id=fp.family_owner  WHERE n.id=? AND u.`status`='0'";
    connection.query(sql1, [notification_id], function (err, result) {
        if (err) {
            console.log(err)
        } else if (result.length > 0) {
            var message = result[0].user_name + " accepted your request to join our family name " + result[0].profile_name
            var sql12 = "insert into notification (own_id,user_id,message,family_id,users_own_id,type) values ?";
            var VALUES = [[result[0].users_own_id, 0, message, result[0].family_id, result[0].users_own_id, '1'],]
            connection.query(sql12, [VALUES], function (err, result1) {
                console.log(result[0].fcm_token)
                if (result1.affectedRows > 0) {

                    var sql1 = "SELECT COUNT(*) as count FROM notification i WHERE i.own_id=? AND i.`status`='0'";

                    connection.query(sql1, [result[0].users_own_id], function (err, count) {
                        if (err) {
                            console.log(err)
                        } else if (count.length > 0) {

                            const message = {
                                to: result[0].fcm_token,
                                notification: {
                                    title: 'Family Tree',
                                    body: result[0].user_name + " accepted your request to join our family name " + result[0].profile_name,
                                    notification_count: count[0].count
                                },
                                data: {

                                    "family_id": result[0].family_id,
                                    "notification_count": count[0].count
                                }


                            };


                            fcm.send(message, function (err, response) {
                                if (err) {
                                    console.log("Something has gone wrong!" + err);
                                    console.log("Response:! " + response);
                                } else {
                                    //showToast("Successfully sent with response");
                                    console.log("Successfully sent with response: ", response);

                                }

                            });
                        }
                    });
                }


                else {
                    resolve(false)
                }
            });
        } else {
            console.log("not inserted")
        }

    });


}



module.exports = { sendInviteSignupMembernotification, sendInviteAcceptSignupMembernotification }


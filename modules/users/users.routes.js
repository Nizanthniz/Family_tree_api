const express = require('express');
var multer = require('multer');
const router = express.Router();
const userController = require('./users.controller');
const auth = require("./../../config/auth")


router.post('/sentotp', userController.sendOtps)
router.post('/insert_data', userController.insert_data)
router.post('/get_data', userController.get_data)
router.post('/get_byid', userController.get_byid)
router.post('/user_signup', userController.user_signup)
router.post('/user_login', userController.user_login)
router.get('/get_gender_master', userController.get_gender_master)
router.post('/save_nodeid', userController.save_nodeid)
router.get('/get_nodeid', userController.get_nodeid)
router.get('/get_relatives', userController.get_relatives)
router.post('/get_notifications', userController.get_notifications)
router.post('/read_notifications', userController.read_notifications)
router.post('/insert_family_profile', userController.insert_family_profile)

router.post('/invite_acceptance', userController.invite_acceptance)
router.post('/getchatuserdetailsbyid', userController.getChatUserDetailsById)
router.post('/getuseridbynodeid', userController.getUserIdByNodeId)
router.post('/getuserdetailsbyid', userController.GetUserDetailsById)

router.post('/updateuserfamilydetails', userController.updateUserFamilyDetails)
router.post('/getremovedfamilymembers', userController.getRemovedFamilyMembers)
router.post('/getallfamilyprofiledetailsbyuserid', userController.GetAllFamilyProfileDetailsByUserId)

router.post('/gethistoryfamilyid',userController.getHistory)
router.post("/getallmembersbyfamily",userController.getallmembersbyfamily);
module.exports = router;
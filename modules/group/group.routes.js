const express = require('express');
const groupController = require('./group.controller');
const router = express.Router();
router.post('/createorupdategroup', groupController.createorupdategroup);
router.post('/addmemberingroup', groupController.addmemberingroup);
router.post('/getallmembersbygroupid', groupController.getallmembersbygroupid);
router.post('/removememberingroup', groupController.removememberingroup);
router.post('/exitgroup', groupController.exitgroup);
router.post('/getallgroupbyuserid', groupController.getAllGroupBYUserId);
router.post('/getremovedfamilymembers',groupController.getRemovedFamilyMembers)

module.exports = router;
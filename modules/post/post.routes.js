const express = require('express');
const postController = require('./post.controller');
const router = express.Router();

router.post('/addposts', postController.postsUpload);
router.post('/getallpost', postController.getAllPostuserid);

module.exports = router;
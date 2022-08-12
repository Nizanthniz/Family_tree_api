const express = require('express');
const postController = require('./post.controller');
const router = express.Router();

router.post('/addposts', postController.postsUpload);
router.post('/getallpost', postController.getAllPostuserid);
router.post('/likepost', postController.likepost);
router.post('/deletepost', postController.deletepostbyid);
router.post('/commentpost', postController.CommentPost);
router.post('/test', postController.Test);

module.exports = router;
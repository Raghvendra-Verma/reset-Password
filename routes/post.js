const express = require("express");
const router = express.Router();
const post = require("../controllers/post");
const fetchUser = require("../middleWare/fetchUser");

router.post("/createPost" , fetchUser, post.createPost );
router.get("/viewPost/:id" , post.viewPost);
router.post("/viewAllPosts" , post.viewAllPosts);
router.put("/updatePost/:id" , fetchUser, post.updatePost);
router.post("/addComments/:id" , fetchUser, post.addComments);
router.put("/updateComments/:postId/:commentId" , fetchUser, post.updateComments);
router.delete("/deletePost/:id" , fetchUser, post.deletePost);
router.get("/viewComments/:id" , post.viewComments);
router.put("/addLikes/:id" , fetchUser , post.addLikes);


module.exports = router;
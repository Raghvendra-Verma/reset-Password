const User = require("../models/user");
const Post = require("../models/post");
const { Comment } = require("../models/comment");
const mongoose = require("mongoose");
require("dotenv").config();

const createPost = async (req, res) => {
    try {

        const post = await new Post({
            user: req.user.id,
            ...req.body,
            likeCounter: 0,
            likeBy: [],
            comment: []
        });
        post.save();
        res.status(200).send({ message: "Post created successfully" })
    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}

const viewPost = async (req, res, next) => {
    try {
        const id = req.params.id;
        const post = await Post.findById({ _id: id }).populate({ path: "likeBy", select: "-password" });
        console.log(post);
        if (!post) {
            return res.status(404).send({ message: "No post found" })
        }
        res.status(200).send(post);
    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}

const viewAllPosts = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        const posts = await Post.find({ user: user._id }).populate({ path: "likeBy", select: "-password" });

        if (!posts) {
            return res.status(404).send({ message: "No posts for this user" })
        }
        res.status(200).send(posts);
    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}

const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }
        const user = req.user.id.toString();
        const userId = post.user.toString();
        if (user !== userId) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const updatedPost = await Post.updateOne({ _id: req.params.id }, { $set: { ...req.body } });
        if (!updatedPost) {
            return res.status(400).send({ message: "Post could not be updated" });
        }

        res.status(200).send({ message: "Post updated successfully" });

    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}

const addComments = async (req, res, next) => {
    try {
        if (req.body.userComment == undefined || req.body.userComment == "") {
            return res.status(400).send({ message: "Could not post a comment" })
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }
        const comment = await new Comment({
            user: req.user.id,
            ...req.body,
        }).save();
        post.comment.push(comment);
        post.save();

        res.status(200).send({ message: "Comment added successfully" })
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const updateComments = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const postId = req.params.postId;
        var flag = false;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }
        const comment = await Comment.findById({ _id: commentId });
        if (!comment) {
            return res.status(404).send({ message: "Comment does not exist" });
        }
        if (comment.user.toString() != req.user.id.toString()) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const updatedComment = await Comment.findOneAndUpdate({ _id: commentId }, { $set: { userComment: req.body.newComment } }, { new: true });
        for (let i = 0; i < post.comment.length; i++) {
            const comm = post.comment[i]._id.toString();
            if (comm == commentId.toString()) {
                post.comment[i].userComment = req.body.newComment;
                post.save();
                if (req.body.userComment === undefined || req.body.userComment === "") {
                    post.comment.splice(i, 1);
                    flag = true;
                }
                break;
            }
        }

        if (!updatedComment || flag) {
            return res.status(400).send({ message: "Comment could not be updated" });
        }

        res.status(200).send({ message: "Comment updated successfully" });

    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }
        const user = req.user.id.toString();
        if (user !== post.user.toString()) {
            return res.status(401).send({ message: "Unauthorized" })
        }
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(400).send({ message: "Post could not be deleted" });
        }

        res.status(200).send({ message: "Post deleted successfully" });

    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const viewComments = async (req, res, next) => {
    try {
        const post = await Post.findById({ _id: req.params.id }).populate({ path: "likeBy", select: "-password" });
        if (!post) {
            return res.status(404).send({ message: "Post not found" })
        }

        var comments = {
            userName: [],
            com: []
        };

        if (post.comment.length === 0) {
            return res.status(404).send({ message: "No Posts found" })
        }
        var count = -1;
        comments = await Promise.all(
            post.comment.map(async (com) => {
                const user = await User.findById(com.user);
                return { userName: user.name, com: com.userComment };
            })
        )

        res.status(200).send(comments);

    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}

const addLikes = async (req, res, next) => {
    try {
        const userId = req.user.id.toString();
        const post = await Post.findById(req.params.id);
        for (let i = 0; i < post.likeBy.length; i++) {
            const likeByUserId = post.likeBy[i].toString();
            if (likeByUserId === userId) {
                --post.likeCounter;
                post.likeBy.splice(i, 1);
                post.save();
                return res.status(200).send({ message: "Like removed" });
            }
        }
        ++post.likeCounter;
        post.likeBy.push(userId);
        post.save();
        res.status(200).send({ message: "Like added" });

    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}


module.exports = {
    createPost,
    viewPost,
    viewAllPosts,
    updatePost,
    addComments,
    updateComments,
    deletePost,
    viewComments,
    addLikes,
}
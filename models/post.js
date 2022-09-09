const mongoose = require("mongoose");
const { commentSchema } = require("./comment");

const postSchema = mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, ref: "User"},
    title: {
        type:String,
        required:true,
        trim:true
    },
    description : {
        type:String,
        requird:true,
        trim:true
    },
    likeCounter : Number,
    likeBy : [{type: mongoose.Types.ObjectId, ref: "User"}],
    comment: [commentSchema]
})

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
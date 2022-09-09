const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, ref: "User"},
    userComment: String
})

module.exports = {
    Comment : new mongoose.model("Comment" , commentSchema ),
    commentSchema: commentSchema
}
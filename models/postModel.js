import mongoose from "mongoose";

const postSchema =  new mongoose.Schema({
    title: String,
    slug: String,
    content: String,
    image: String,
    creatdAt: {
        type: Date,
        default: new Date(),
    }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
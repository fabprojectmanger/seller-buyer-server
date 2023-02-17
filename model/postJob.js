const { mongoose } = require("mongoose")

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
    },

    email: {
        type: String
    },
    location: {
        type: String,
    },
    budget: {
        type: Number,
    },
    description: {
        type: String
    },

    phone: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
    },

    subCategory: {
        type: String,
    },

    tags: [{
        type: String
    }],
})

const Post = new mongoose.model("Post", PostSchema)
module.exports = Post
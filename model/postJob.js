const { mongoose } = require("mongoose")

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                // throw new Error("Budget should not be negative")
                return "Budget should not be negative"
            }
        }
    },
    description: {
        type: String,
        required: true
    },

    phone: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true

    },

    subCategory: {
        type: String,
        required: true

    },

    tags: [{
        type: String,
        required: true

    }],
})

const Post = new mongoose.model("Post", PostSchema)
module.exports = Post
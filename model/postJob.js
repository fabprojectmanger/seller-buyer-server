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
    description: {
        type: String,
        required: true
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
    image: {
        type: String
    },
    price: {
        type: String
    },
    unit: {
        type: String
    },
    videoLink: {
        type: String
    },
    pricePerUnit: {
        type:Number
    }

})

const Post = new mongoose.model("Post", PostSchema)
module.exports = Post
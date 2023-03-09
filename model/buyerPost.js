const { mongoose } = require("mongoose")

const buyerPostSchema = new mongoose.Schema({
    title: {
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
    budget: {
        type: Number
    },
    quantity: {
        type: String
    },
    email: {
        type: String
    }
})

const BuyerPost = new mongoose.model("BuyerPost", buyerPostSchema)
module.exports = BuyerPost
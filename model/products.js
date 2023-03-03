const { mongoose } = require("mongoose")

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    email: {
        type: String,
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
        type: Number
    },
    name: {
        type: String
    },
    nameOfOrganization: {
        type: String
    },
    phone: {
        type: String
    }

})

const Product = new mongoose.model("Product", ProductSchema)
module.exports = Product
const { mongoose } = require("mongoose")

const registerSchema = new mongoose.Schema({

    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },

    nameOfOrganization: {
        type: String,
    },
    email: {
        type: String,
    },
    gst: {
        type: String,
    },
    pan: {
        type: String,
    },

    address: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
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



const UserRegister = new mongoose.model("UserRegister", registerSchema)

module.exports = UserRegister;
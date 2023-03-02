const { mongoose } = require("mongoose")
const { default: isEmail } = require("validator/lib/isemail");

const registerSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String
    },

    nameOfOrganization: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    gst: {
        type: String,
        unique: true
    },
    pan: {
        type: String,
        unique: true
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
        unique: true

    },
    category: {
        type: String,

    },

    subCategory: {
        type: String,
    },

    tags: [{
        type: String,
        required: true

    }],
})

const UserRegister = new mongoose.model("UserRegister", registerSchema)

module.exports = UserRegister;
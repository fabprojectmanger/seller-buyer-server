const { mongoose } = require("mongoose")

const registerSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        unique: true,
        required: true,
    },
    gst: {
        type: String,
    },
    pan: {
        type: String,
    },

    address: {
        type: String,
    },
    nameOfOrganization: {
        type: String,
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
    role:{
        type:String
    }
})

const UserRegister = new mongoose.model("UserRegister", registerSchema)

module.exports = UserRegister;
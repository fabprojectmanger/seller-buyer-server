const { mongoose } = require("mongoose")
const validator = require('validator');
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

    nameOfOrganization: {
        type: String,
        unique: true,

    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: isEmail,
            message: 'Email address is invalid',
        }
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
        validate: {
            validator: function (password) {
                return password.length >= 8 && password.match(/\d/) && password.match(/[a-z]/) && password.match(/[A-Z]/);
            },
            message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit',
        },
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

registerSchema.path('email').validate(async (email) => {
    const count = await UserRegister.countDocuments({ email });
    return !count;
}, 'Email address already in use');




const UserRegister = new mongoose.model("UserRegister", registerSchema)

module.exports = UserRegister;
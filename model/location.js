const { mongoose } = require("mongoose")

const LocationSchema = new mongoose.Schema({

    ip: {
        type: String,
        unique: true,
    },

    city: {
        type: String,
    },
    region: {
        type: String,
    },
    country: {
        type: String
    }

})

const Location = new mongoose.model("Location", LocationSchema)
module.exports = Location
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  mobileNumber: {
    type: String,
    required: true,
    max: 10
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
  role: {
    type: String
  },
  otp: {
    type: String
  },
  location: {
    type: String
  }

});

module.exports = mongoose.model("Users", userSchema);

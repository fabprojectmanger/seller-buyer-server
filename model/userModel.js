const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    min: 3,
    max: 20,
  },
  email: {
    type: String,
    unique: true,
    max: 50,
  },
  password: {
    type: String,
    min: 8,
  },
  mobileNumber: {
    type: String,
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

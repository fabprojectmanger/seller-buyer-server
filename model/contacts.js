const { mongoose } = require("mongoose");

const ContactsSchema = new mongoose.Schema(
  {
    sellerEmail: {
        type: String,
    },
    sellerName: {
      type: String,
    },
    buyerEmail: {
      type: String,
    },
    buyerName: {
      type: String,
    },
  },
  { timestamps: true }
);

const Contacts = new mongoose.model("Contacts", ContactsSchema);
module.exports = Contacts;
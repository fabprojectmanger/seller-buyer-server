const { mongoose } = require("mongoose");
const ContactListSchema = new mongoose.Schema(
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
  );
  
  const ContactsList = new mongoose.model("Contacts", ContactListSchema);
  module.exports = ContactsList;
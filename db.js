const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODBURI).then(() => {
  console.log("Connected to Database");
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  repeatPassword: String,
  businessCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
});

const BusinessCardSchema = new mongoose.Schema({
  name: String,
  about: String,
  interests: String,
  phone: String,
  linkedin: String,
  twitter: String,
  facebook: String,
  instagram: String,
  github: String,
  stackOverflow: String,
});

const User = mongoose.model("User", UserSchema);
const Card = mongoose.model("Card", BusinessCardSchema);

module.exports = {
  User,
  Card,
};

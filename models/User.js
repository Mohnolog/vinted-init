const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
    // unique : true permet de s'assurer que 2 users ne peuvent pas avoir le même email
    unique: true,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    avatar: Object,
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;

const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Middleware permettant de recevoir des formData
const fileUpload = require("express-fileupload");
// Fonction permettant de transformer un Buffer en Base64
const convertToBase64 = require("../tools/convertToBase64");
// Import du package cloudinary
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    if (req.body.email && req.body.username && req.body.password) {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        const salt = uid2(16);
        const token = uid2(32);
        const saltedPassword = req.body.password + salt;
        const hash = SHA256(saltedPassword).toString(encBase64);

        const newUser = new User({
          email: req.body.email,
          account: {
            username: req.body.username,
            // avatar: Object,
          },
          newsletter: req.body.newsletter,
          token,
          hash,
          salt,
        });

        // Si je reçois une image, je l'upload sur cloudinary et j'enregistre le résultat dans la clef avatar de la clef account de mon nouvel utilisateur
        if (req.files?.avatar) {
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.avatar),
            {
              folder: `vinted/users/${newUser._id}`,
              public_id: "avatar",
            }
          );
          newUser.account.avatar = result;
        }

        await newUser.save();
        const responseObject = {
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        };

        return res.status(201).json(responseObject);
      } else {
        res.status(400).json({ message: "email adress already exists " });
      }
    } else {
      return res.status(400).json({ message: "missing parameters" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (!existingUser) {
      return res.status(401).json({
        message: "User not found",
      });
    } else {
      const newSaltedPassword = req.body.password + existingUser.salt;
      console.log(newSaltedPassword);
      const newHash = SHA256(newSaltedPassword).toString(encBase64);
      if (existingUser.hash !== newHash) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      } else {
        const responseObject = {
          _id: existingUser._id,
          token: existingUser.token,
          account: existingUser.acount,
        };

        return res.status(200).json(responseObject);
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

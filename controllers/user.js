"use strict";

const services = require("../services");
const input = require("../services/inputValidators");
const tokenGen = require("../services/token");
const mail = require("../services/mailManager");
const bcrypt = require("bcrypt-nodejs");
const crypto = require("crypto");
const User = require("../models/user");
const config = require("../config");
const path = require("path");

const image = require("../middlewares/imageUpload");

function signUp(req, res) {
  let email = req.body.email;
  let displayName = req.body.displayName;
  let password = req.body.password;

  if (!input.validEmail(email))
    return res.status(400).send({ message: "Email not valid" });
  email = services.normEmail(email);
  if (!input.validPassword(password))
    return res.status(400).send({ message: "Password not valid" });
  if (!input.validName(displayName))
    return res.status(400).send({ message: "Name not valid" });

  let ext = image.obtainExt(req.file);
  if (!ext) return res.status(400).send({ message: "Invalid image" });
  let imageName = "";
  const numPasses = 6;
  for (let c = 0; c < numPasses; c++) {
    imageName += Math.random()
      .toString(36)
      .substring(2, 15);
  }
  imageName += ext;
  const imagePath = path.join(config.USER_IMAGES_PATH, imageName);

  User.findOne({ email: email }).exec((err, userExist) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (userExist)
      return res
        .status(409)
        .send({ message: "Already exist a user with this email" });

    crypto.randomBytes(20, (err, token) => {
      if (err) return res.status(500).send({ message: "Internal error" });
      if (!token) return res.status(500).send({ message: "Internal error" });
      const expires = Date.now() + 3600000 * config.VERIFY_EMAIL_EXP;
      const user = new User({
        email: email,
        displayName: displayName,
        avatarImage: imagePath,
        password: password,
        status: "Created",
        balance: 0,
        verifyEmailToken: token.toString("hex"),
        verifyEmailExpires: expires
      });

      user.save((err, user) => {
        if (err) return res.status(500).send({ message: "Internal error" });
        if (!user) return res.status(500).send({ message: "Internal error" });
        mail.sendWelcomeEmail(
          user.email,
          user.displayName,
          user.verifyEmailToken
        );

        image.saveToDisk(req.file, imagePath, null);

        return res.status(200).send({ message: "User created" });
      });
    });
  });
}

function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const sessionOnly = req.body.sessionOnly; //TODO:
  if (!input.validEmail(email))
    return res.status(404).send({ message: "Invalid email" });
  if (!password)
    return res.status(404).send({ message: "Password field is empty" });

  User.findOne({ email: email })
    .select("+password +admin")
    .exec((err, user) => {
      if (err) return res.status(500).send({ message: "Internal error" });
      if (!user)
        return res.status(404).send({ message: "Wrong email or password" });

      if (config.EMAIL_VERIFICATION && user.status !== "Verified")
        return res.status(401).send({ message: "Email verification required" });

      bcrypt.compare(password, user.password, (err, equals) => {
        if (err) return res.status(500).send({ message: "Internal error" });
        if (!equals)
          return res.status(404).send({ message: "Wrong email or password" });
        const token = tokenGen.generate(user);
        res.cookie("token", token, {
          maxAge: config.EXP_DAYS * 24 * 3600000,
          httpOnly: true,
          sameSite: true
        });
        return res.status(200).send({
          isAdmin: services.isAdmin(user),
          token: token,
          message: "Success"
        });
      });
    });
}

function logout(req, res) {
  res.clearCookie("token");
  return res.sendStatus(200);
}

function updateUserData(req, res) {
  const name = req.body.displayName;
  const password = req.body.password;
  const ext = image.obtainExt(req.file);

  if (!name && !password && !ext)
    return res.status(400).send({ message: "Name or password required" });

  let updatedFields = {};
  if (name) {
    if (!input.validName(name))
      return res.status(400).send({ message: "Name not valid" });
    updatedFields.displayName = name;
  }
  if (password) {
    if (!input.validPassword(password))
      return res.status(400).send({ message: "Password not valid" });
    updatedFields.password = password;
  }
  if (ext) {
    let imageName = "";
    const numPasses = 6;
    for (let c = 0; c < numPasses; c++) {
      imageName += Math.random()
        .toString(36)
        .substring(2, 15);
    }
    imageName += ext;
    updatedFields.avatarImage = path.join(config.USER_IMAGES_PATH + imageName);
  }

  User.findById(req.user, (err, user) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (updatedFields.avatarImage)
      image.saveToDisk(req.file, updatedFields.avatarImage, null);

    user.set(updatedFields);
    user.save(err => {
      if (err) return res.status(500).send({ message: "Internal error" });
      return res.sendStatus(200);
    });
  });
}

function getUserData(req, res) {
  User.findById(req.user)
    .select("-_id")
    .exec((err, user) => {
      if (err) return res.status(500).send({ message: "Internal error" });
      if (!user) return res.status(404).send({ message: "User not found" });
      return res.status(200).send(user);
    });
}

function getUser(req, res) {
  let userId = req.params.id;
  if (!input.validId(userId))
    return res.status(400).send({ message: "Invalid user id" });

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (!user) return res.status(404).send({ message: "User not found" });
    return res.status(200).send(user);
  });
}

function getUserList(req, res) {
  User.find({}, (err, users) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (!users)
      return res.status(404).send({ message: "Users not found or empty list" });
    res.status(200).send(users);
  });
}

function restorePassword(req, res) {
  const email = req.body.email;
  if (!input.validEmail(email)) return res.sendStatus(400);

  User.findOne({ email: email }).exec((err, user) => {
    if (!user) return res.status(404).send({ message: "User not found" });
    crypto.randomBytes(20, (err, token) => {
      if (err) return res.status(500).send({ message: "Internal error" });
      if (!token) return res.status(500).send({ message: "Internal error" });
      const expires = Date.now() + 3600000 * config.RESTORE_PASS_EXP;
      user.resetPasswordToken = token.toString("hex");
      user.resetPasswordExpires = expires;
      user.save((err, user) => {
        mail.sendPasswordEmail(
          user.email,
          user.displayName,
          user.resetPasswordToken
        );
        return res.sendStatus(200);
      });
    });
  });
}

function resetPasswordPost(req, res) {
  const tokenSplit = req.query.token.split("/");
  const email = services.decrypt(tokenSplit[0]);
  const token = tokenSplit[1];
  const password = req.body.password;

  if (!input.validPassword(password))
    return res.status(400).send({ message: "Invalid password" });

  User.findOne({ email: email })
    .select("+password +resetPasswordExpires +resetPasswordToken")
    .exec((err, user) => {
      if (err) return res.status(500).send({ message: "Internal error" });
      if (!user) return res.status(404).send({ message: "User not found" });
      if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now())
        return res.status(410).send({ message: "Expired token" });
      if (!user.resetPasswordToken || user.resetPasswordToken !== token)
        return res.status(401).send({ message: "Invalid token" });

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.save((err, user) => {
        if (err) return res.status(500).send({ message: "Internal error" });
        return res.sendStatus(200);
      });
    });
}

function deleteUser(req, res) {
  let userId = req.params.id;
  if (!input.validId(userId))
    return res.status(400).send({ message: "Invalid user id" });

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (!user) return res.status(404).send({ message: "User not found" });
    user.remove();
    return res.sendStatus(200);
  });
}

function setUserStatus(req, res) {
  //TODO: Change this by a email validation
  let userId = req.params.id;
  let status = req.body.status;
  if (!input.validId(userId))
    return res.status(400).send({ message: "Invalid user id" });
  if (!input.validStatus(status))
    return res.status(400).send({ message: "Invalid status" });

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (!user) return res.status(404).send({ message: "User not found" });
    user.set({ status: status });
    user.save((err, userStored) => {
      return res.sendStatus(200);
    });
  });
}

function verifyEmail(req, res) {
  const tokenSplit = req.query.token.split("/");
  const email = services.decrypt(tokenSplit[0]);
  const token = tokenSplit[1];

  User.findOne({ email: email })
    .select("+verifyEmailToken +verifyEmailExpires")
    .exec((err, user) => {
      if (err) return res.status(500).send({ message: "Internal error" });
      if (!user) return res.status(404).send({ message: "User not found" });
      if (user.status === "Verified")
        return res.status(410).send({ message: "User already verified" });
      if (!user.verifyEmailExpires || user.verifyEmailExpires < Date.now())
        return res.status(410).send({ message: "Expired token" });
      if (!user.verifyEmailToken || user.verifyEmailToken !== token)
        return res.status(401).send({ message: "Invalid token" });

      user.status = "Verified";
      user.verifyEmailToken = undefined;
      user.verifyEmailExpires = undefined;
      user.save((err, user) => {
        if (err) return res.status(500).send({ message: "Internal error" });
        return res.status(200).send({
          message: "User verified"
        });
      });
    });
}

function scale(req, res) {
  let email = req.body.email;
  const key = req.body.key;

  if (!input.validEmail(email))
    return res.status(400).send({ message: "Email not valid" });

  email = services.normEmail(email);

  User.findOne({ email: email }).exec((err, userExist) => {
    if (err) return res.status(500).send({ message: "Internal error" });
    if (!userExist)
      return res
        .status(409)
        .send({ message: "Not exist a user with this email" });

    if (key === config.ADMIN_TOKEN)
      User.findByIdAndUpdate(
        userExist._id,
        { $set: { admin: key } },
        { new: true },
        function(err, updatedUser) {
          if (err) return res.status(500).send({ message: "Internal error" });
          if (!updatedUser)
            return res
              .status(409)
              .send({ message: "Not exist a user with this email" });

          updatedUser.save();

          return res.status(200).send({ message: "User modified" });
        }
      );
  });
}

module.exports = {
  signUp,
  login,
  logout,
  updateUserData,
  getUserData,
  getUser,
  getUserList,
  restorePassword,
  resetPasswordPost,
  deleteUser,
  setUserStatus,
  verifyEmail,
  scale
};

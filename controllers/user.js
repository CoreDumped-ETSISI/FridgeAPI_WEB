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
const rtn = require("../middlewares/apiResults");

const dict = require("../middlewares/dictionary");

function signUp(req, res) {
  let email = req.body.email;
  let displayName = req.body.displayName;
  let password = req.body.password;

  if (!input.validEmail(email))
    return rtn.msgNotValid(res, 400, dict.items.mail);
  email = services.normEmail(email);
  if (!input.validPassword(password))
    return rtn.msgNotValid(res, 400, dict.items.pass);
  if (!input.validName(displayName))
    return rtn.msgNotValid(res, 400, dict.items.name);

  let ext = image.obtainExt(req.file);
  if (!ext) return rtn.message(res, 400, dict.errMsgs.imageNotValid);
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
    if(err) return rtn.intrServErr(res);
    if (userExist) return rtn.message(res, 409, dict.errMsgs.repeatedMail);

    crypto.randomBytes(20, (err, token) => {
      if(err) return rtn.intrServErr(res);
      if (!token) return rtn.intrServErr(res);
      const expires = Date.now() + 3600000 * config.VERIFY_EMAIL_EXP;
      const user = new User({
        email: email,
        displayName: displayName,
        avatarImage: imagePath,
        password: password,
        status: dict.userStatus.created,
        balance: 0,
        verifyEmailToken: token.toString("hex"),
        verifyEmailExpires: expires
      });

      user.save((err, user) => {
        if(err) return rtn.intrServErr(res);
        if (!user) return rtn.intrServErr(res);
        mail.sendWelcomeEmail(
          user.email,
          user.displayName,
          user.verifyEmailToken
        );

        image.saveToDisk(req.file, imagePath, null);

        return rtn.message(res, 200, dict.msg200.userCreated);
      });
    });
  });
}

function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const sessionOnly = req.body.sessionOnly; //TODO:
  if (!input.validEmail(email))
    return rtn.message(res, 404, dict.errMsgs.mailNotValid);
  if (!password)
    return rtn.message(res, 404, dict.errMsgs.passEmpty);

  User.findOne({ email: email })
    .select("+password +admin")
    .exec((err, user) => {
      if (err) return rtn.intrServErr(res);
      if (!user) return rtn.message(res, 404, dict.errMsgs.wrongEmailPass);

      if (config.EMAIL_VERIFICATION && user.status !== dict.userStatus.verified)
        return rtn.message(res, 401, dict.errMsgs.mailVerifRequired);

      bcrypt.compare(password, user.password, (err, equals) => {
        if(err) return rtn.intrServErr(res);
        if (!equals)
          return rtn.message(res, 404, dict.errMsgs.wrongEmailPass);
        const token = tokenGen.generate(user);
        res.cookie(dict.cT.token, token, {
          maxAge: config.EXP_DAYS * 24 * 3600000,
          httpOnly: true,
          sameSite: true
        });
        return rtn.obj(res, 200, {
          isAdmin: services.isAdmin(user),
          token: token,
          message: dict.msg200.success
        });
      });
    });
}

function logout(req, res) {
  res.clearCookie(dict.cT.token);
  return rtn.status(res, 200);
}

function updateUserData(req, res) {
  const name = req.body.displayName;
  const password = req.body.password;
  const ext = image.obtainExt(req.file);

  if (!name && !password && !ext)
    return rtn.message(res, 400, dict.errMsgs.nameOrPassRequired);

  let updatedFields = {};
  if (name) {
    if (!input.validName(name))
      return rtn.msgNotValid(res, 400, dict.items.name);
    updatedFields.displayName = name;
  }
  if (password) {
    if (!input.validPassword(password))
      return rtn.msgNotValid(res, 400, dict.items.pass);
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
    if(err) return rtn.intrServErr(res);
    if (!user) return rtn.notFound(res, dict.objs.user);

    if (updatedFields.avatarImage)
      image.saveToDisk(req.file, updatedFields.avatarImage, null);

    user.set(updatedFields);
    user.save(err => {
      if(err) return rtn.intrServErr(res);
      return rtn.status(res, 200);
    });
  });
}

function getUserData(req, res) {
  User.findById(req.user)
    .select("-_id")
    .exec((err, user) => {
      if(err) return rtn.intrServErr(res);
      if (!user) return rtn.msgNotValid(res, dict.objs.user);
      return rtn.obj(res, 200, user);
    });
}

function getUser(req, res) {
  let userId = req.params.id;
  if (!input.validId(userId))
    return rtn.message(res, 400, "Invalid user id");

  User.findById(userId, (err, user) => {
    if(err) return rtn.intrServErr(res);
    if (!user) return rtn.msgNotFound(res, dict.objs.user);
    return rtn.obj(res, 200, user);
  });
}

function getUserList(req, res) {
  User.find({}, (err, users) => {
    if(err) return rtn.intrServErr(res);
    if (!users)
      return rtn.message(res, 404, "Users not found or empty list");
    rtn.obj(res, 200, users);
  });
}

function restorePassword(req, res) {
  const email = req.body.email;
  if (!input.validEmail(email)) return rtn.status(res, 400);

  User.findOne({ email: email }).exec((err, user) => {
    if (!user) return rtn.msgNotFound(res, dict.objs.user);
    crypto.randomBytes(20, (err, token) => {
      if(err) return rtn.intrServErr(res);
      if (!token) return rtn.intrServErr(res);
      const expires = Date.now() + 3600000 * config.RESTORE_PASS_EXP;
      user.resetPasswordToken = token.toString("hex");
      user.resetPasswordExpires = expires;
      user.save((err, user) => {
        mail.sendPasswordEmail(
          user.email,
          user.displayName,
          user.resetPasswordToken
        );
        return rtn.status(res, 200);
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
    return rtn.message(res, 400, "Invalid password");

  User.findOne({ email: email })
    .select("+password +resetPasswordExpires +resetPasswordToken")
    .exec((err, user) => {
      if(err) return rtn.intrServErr(res);
      if (!user) return rtn.msgNotFound(res, dict.objs.user);
      if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now())
        return rtn.message(res, 410, "Expired token");
      if (!user.resetPasswordToken || user.resetPasswordToken !== token)
        return rtn.message(res, 401, "Invalid token");

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.save((err, user) => {
        if(err) return rtn.intrServErr(res);
        return rtn.status(res, 200);
      });
    });
}

function deleteUser(req, res) {
  let userId = req.params.id;
  if (!input.validId(userId))
    return rtn.message(res, 400, "Invalid user id");

  User.findById(userId, (err, user) => {
    if(err) return rtn.intrServErr(res);
    if (!user) return rtn.msgNotFound(res, dict.objs.user);
    user.remove();
    return rtn.status(res, 200);
  });
}

function setUserStatus(req, res) {
  //TODO: Change this by a email validation
  let userId = req.params.id;
  let status = req.body.status;
  if (!input.validId(userId))
    return rtn.message(res, 400, "Invalid user id");
  if (!input.validStatus(status))
    return rtn.message(res, 400, "Invalid status");

  User.findById(userId, (err, user) => {
    if(err) return rtn.intrServErr(res);
    rtn.notFound(res, user, dict.objs.user);
    user.set({ status: status });
    user.save((err, userStored) => {
      if(err) return rtn.intrServErr(res);
      if (!userStored) return rtn.message(res, 404, "User not saved");
      return rtn.status(res, 200);
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
      if(err) return rtn.intrServErr(res);
      if(!user) return rtn.notFound(res, user, dict.objs.user);
      if (user.status === dict.userStatus.verified)
        return rtn.message(res, 410, "User already verified");
      if (!user.verifyEmailExpires || user.verifyEmailExpires < Date.now())
        return rtn.message(res, 410, "Expired token");
      if (!user.verifyEmailToken || user.verifyEmailToken !== token)
        return rtn.message(res, 401, "Invalid token");

      user.status = dict.userStatus.verified;
      user.verifyEmailToken = undefined;
      user.verifyEmailExpires = undefined;
      user.save((err, user) => {
        if(err) return rtn.intrServErr(res);
        if(!user) return rtn.notFound(res, user, dict.objs.user)
        return rtn.message(res, 200, "User verified");
      });
    });
}

function scale(req, res) {
  let email = req.body.email;
  const key = req.body.key;

  if (!input.validEmail(email))
    return rtn.msgNotValid(res, dict.objs.email);

  email = services.normEmail(email);

  User.findOne({ email: email }).exec((err, userExist) => {
    if(err) return rtn.intrServErr(res);
    if (!userExist)
      return rtn.message(res, 409, dict.errMsgs.userOfEmailNotExists);

    if (key === config.ADMIN_TOKEN)
      User.findByIdAndUpdate(
        userExist._id,
        { $set: { admin: key } },
        { new: true },
        function(err, updatedUser) {
          if(err) return rtn.intrServErr(res);
          if (!updatedUser)
            return rtn.message(res, 409, dict.errMsgs.userOfEmailNotExists);

          updatedUser.save();

          return rtn.message(res, 200, dict.msg200.userModified);
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

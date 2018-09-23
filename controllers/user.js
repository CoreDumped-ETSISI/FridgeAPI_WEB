'use strict';

const services = require('../services');
const input = require('../services/inputValidators');
const tokenGen = require('../services/token');
const mail = require('../services/mailManager');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const User = require('../models/user');
const config = require('../config');
const path = require('path');

const image = require('../middlewares/imageUpload');

function signUp(req, res) {
    let email = req.body.email;
    let displayName = req.body.displayName;
    let password = req.body.password;

    if (!input.validEmail(email)) return res.sendStatus(400);
    email = services.normEmail(email);
    if (!input.validPassword(password)) return res.sendStatus(400);
    if (!input.validName(displayName)) return res.sendStatus(400);

    let ext = image.obtainExt(req.file);
    if (!ext) return res.sendStatus(400);
    let imageName = '';
    const numPasses = 6;
    for(let c = 0; c < numPasses; c++){
        imageName += Math.random().toString(36).substring(2, 15);
    }
    imageName += ext;

    User.findOne({email: email})
        .exec((err, userExist) => {
            if (err) return res.status(500).send({ message: 'Internal error'});
            if (userExist) return res.sendStatus(409);

            crypto.randomBytes(20, (err, token) => {
                if (err) return res.status(500).send({ message: 'Internal error'});
                if (!token) return res.status(500).send({ message: 'Internal error'});
                const expires = Date.now() + 3600000 * config.VERIFY_EMAIL_EXP;
                const user = new User({
                    email: email,
                    displayName: displayName,
                    avatarImage: config.USER_IMAGES_PATH + imageName,
                    password: password,
                    status: "Created",
                    balance: 0,
                    verifyEmailToken: token.toString('hex'),
                    verifyEmailExpires: expires
                });
                user.save((err, user) => {
                    if (err) return res.status(500).send({ message: 'Internal error'});
                    if (!user) return res.status(500).send({ message: 'Internal error'});
                    mail.sendWelcomeEmail(user.email, user.displayName, user.verifyEmailToken);

                    const imagePath = path.join(config.USER_IMAGES_PATH, imageName);
                    image.saveToDisk(req.file, imagePath, null);

                    return res.sendStatus(200)
                })
            })
        })
}

function login(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const sessionOnly = req.body.sessionOnly; //TODO:
    if (!input.validEmail(email)) return res.status(404).send({ message: 'Invalid email'});
    if (!password) return res.status(404).send({ message: 'Password field is empty'});

    User.findOne({email: email})
        .select('+password +admin')
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: 'Internal error'});
            if (!user) return res.status(404).send({ message: 'Wrong email or password'});

            if (config.EMAIL_VERIFICATION && user.status !== 'Verified') return res.sendStatus(401);

            bcrypt.compare(password, user.password, (err, equals) => {
                if (err) return res.status(500).send({ message: 'Internal error'});
                if (!equals) return res.status(404).send({ message: 'Wrong email or password'});
                const token = tokenGen.generate(user);
                res.cookie('token', token, {
                    maxAge: config.EXP_DAYS * 24 * 3600000,
                    httpOnly: true,
                    sameSite: true
                });
                return res.status(200).send({
                    isAdmin: services.isAdmin(user),
                    token: token,
                    message: 'Success'
                })
            })
        })
}

function logout(req, res) {
    res.clearCookie('token');
    return res.sendStatus(200);
}

function updateUserData(req, res) {
    if (!req.body.displayName &&
        !req.body.password)
        return res.sendStatus(400);

    let updatedFields = {};
    if (req.body.displayName) {
        updatedFields.displayName = req.body.displayName;
        if (!input.validName(updatedFields.displayName)) return res.sendStatus(400)
    }
    //if(req.file)
    //    updatedFields.avatarImage = config.USER_IMAGES_PATH + req.file.filename;
    /*if (req.body.avatarImage) {
        updatedFields.avatarImage = req.body.avatarImage;
        if (!input.validURL(updatedFields.avatarImage)) return res.sendStatus(400)
    }*/
    if (req.body.password) {
        updatedFields.password = req.body.password;
        if (!input.validPassword(updatedFields.password)) return res.sendStatus(400)
    }

    User.findById(req.user, (err, user) => {
        if (err) return res.status(500).send({ message: 'Internal error'});
        if (!user) return res.sendStatus(404);
        user.set(updatedFields);
        user.save((err) => {
            if (err) return res.status(500).send({ message: 'Internal error'});
            return res.sendStatus(200)
        })
    })
}

function getUserData(req, res) {
    User.findById(req.user)
        .select("-_id")
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: 'Internal error'});
            if (!user) return res.status(404).send({ message: 'User not found'});
            return res.status(200).send(user)
        })
}

function getUser(req, res) {
    let userId = req.params.id;
    if (!input.validId(userId)) return res.sendStatus(400);

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Internal error'});
        if (!user) return res.status(404).send({ message: 'User not found'});
        return res.status(200).send(user)
    })
}

function getUserList(req, res) {
    User.find({}, (err, users) => {
        if (err) return res.status(500).send({ message: 'Internal error'});
        if (!users) return res.status(404).send({ message: 'Users not found or empty list'});
        res.status(200).send(users)
    })
}

function restorePassword(req, res) {
    const email = req.body.email;
    if (!input.validEmail(email)) return res.sendStatus(400);

    User.findOne({email: email})
        .exec((err, user) => {
            if (!user) return res.sendStatus(404);
            crypto.randomBytes(20, (err, token) => {
                if (err) return res.status(500).send({ message: 'Internal error'});
                if (!token) return res.status(500).send({ message: 'Internal error'});
                const expires = Date.now() + 3600000 * config.RESTORE_PASS_EXP;
                user.resetPasswordToken = token.toString('hex');
                user.resetPasswordExpires = expires;
                user.save((err, user) => {
                    mail.sendPasswordEmail(user.email, user.displayName, user.resetPasswordToken);
                    return res.sendStatus(200)
                })
            })
        })
}

function resetPasswordPost(req, res) {
    const tokenSplit = req.query.token.split('/');
    const email = services.decrypt(tokenSplit[0]);
    const token = tokenSplit[1];
    const password = req.body.password;

    if (!input.validPassword(password)) return res.sendStatus(400);

    User.findOne({email: email})
        .select('+password +resetPasswordExpires +resetPasswordToken')
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: 'Internal error'});
            if (!user) return res.sendStatus(404);
            if (!user.resetPasswordExpires ||
                user.resetPasswordExpires < Date.now()) return res.sendStatus(410);
            if (!user.resetPasswordToken ||
                user.resetPasswordToken !== token) return res.sendStatus(401);

            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.save((err, user) => {
                if (err) return res.status(500).send({ message: 'Internal error'});
                return res.sendStatus(200)
            })
        })
}

function deleteUser(req, res) {
    let userId = req.params.id;
    if (!input.validId(userId)) return res.sendStatus(400);

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Internal error'});
        if (!user) return res.sendStatus(404);
        user.remove();
        return res.sendStatus(200)
    })
}

function setUserStatus(req, res) {   //TODO: Change this by a email validation
    let userId = req.params.id;
    let status = req.body.status;
    if (!input.validId(userId)) return res.sendStatus(400);
    if (!input.validStatus(status)) return res.sendStatus(400);

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Internal error'});
        if (!user) return res.sendStatus(404);
        user.set({status: status});
        user.save((err, userStored) => {
            return res.sendStatus(200)
        })
    })
}

function verifyEmail(req, res) {
    const tokenSplit = req.query.token.split('/');
    const email = services.decrypt(tokenSplit[0]);
    const token = tokenSplit[1];

    User.findOne({email: email})
        .select('+verifyEmailToken +verifyEmailExpires')
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: 'Internal error'});
            if (!user) return res.sendStatus(404);
            if (user.status === 'Verified') return res.sendStatus(410);
            if (!user.verifyEmailExpires ||
                user.verifyEmailExpires < Date.now()) return res.sendStatus(410);
            if (!user.verifyEmailToken ||
                user.verifyEmailToken !== token) return res.sendStatus(401);

            user.status = 'Verified';
            user.verifyEmailToken = undefined;
            user.verifyEmailExpires = undefined;
            user.save((err, user) => {
                if (err) return res.status(500).send({ message: 'Internal error'});
                return res.sendStatus(200)  //TODO: return token
            })
        })
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
    verifyEmail
};

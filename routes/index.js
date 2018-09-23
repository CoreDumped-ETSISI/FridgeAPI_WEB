'use strict';

const express = require('express');
const router = express.Router();

const uploader = require('../middlewares/imageUpload');
const userCtrl = require('../controllers/user');

/* API ROUTES */
//PUBLIC
router.post('/signUp', uploader.userImage.single('avatarImage'), userCtrl.signUp);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.post('/verifyEmail', userCtrl.verifyEmail);
router.post('/restorePassword', userCtrl.restorePassword);
router.post('/resetPassword', userCtrl.resetPasswordPost);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const uploader = require('../middlewares/imageUpload');

//AUTH
router.get('/', auth, userCtrl.getUserData);
router.patch('/', auth, uploader.productImage.single('avatarImage'), userCtrl.updateUserData);
router.post('/scale', /*auth, */userCtrl.scale);

//ADMIN
router.get('/list', auth, admin, userCtrl.getUserList);
router.get('/id/:id', auth, admin, userCtrl.getUser);
router.post('/id/:id/status', auth, admin, userCtrl.setUserStatus);
router.post('/id/:id/status', auth, admin, userCtrl.scale);
router.delete('/id/:id', auth, admin, userCtrl.deleteUser);

module.exports = router;

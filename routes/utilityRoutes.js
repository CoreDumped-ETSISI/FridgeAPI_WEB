'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config');

const User = require('../models/user');
const Product = require('../models/product');
const Payment = require('../models/payment');
const Purchase = require('../models/purchase');

router.delete('/restartDB', (req, res) => {
    User.deleteMany({}, function (err) {
        console.log('User collection removed');
        const user = new User({
            email: config.ADMIN_USER,
            displayName: 'Admin',
            password: config.ADMIN_PASS,
            admin: config.ADMIN_TOKEN,
            status: 'Verified',
            balance: 0,
            avatarImage: '/images/avatar.png'
        });
        user.save((err, user) => {
            if (err) return res.sendStatus(500);
            if (!user) return res.sendStatus(500);
            return res.sendStatus(200);
        })
    });
    Product.deleteMany({}, function (err) {
        console.log('Product collection removed')
    });
    Payment.deleteMany({}, function (err) {
        console.log('Payment collection removed')
    });
    Purchase.deleteMany({}, function (err) {
        console.log('Purchase collection removed')
    });

});

module.exports = router;

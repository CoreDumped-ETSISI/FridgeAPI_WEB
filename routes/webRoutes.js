'use strict';

const express = require('express');
const router = express.Router();

/* WEB ROUTES */

router.get('/', function (req, res, next) {
    res.render('store', {});
});

router.get('/store', function (req, res, next) {
    res.render('store', {});
});

router.get('/purchase-history', function (req, res, next) {
    res.render('purchase_history', {});
});

router.get('/payment-history', function (req, res, next) {
    res.render('payment_history', {});
});

router.get('/login', function (req, res, next) {
    res.render('login', {});
});

router.get('/register', function (req, res, next) {
    res.render('register', {});
});

router.get('/verify-email', function (req, res, next) {
    res.render('verifyEmail', {});
});

router.get('/forgot-password', function (req, res, next) {
    res.render('forgotPassword', {});
});

router.get('/reset-password', function (req, res, next) {
    res.render('resetPassword', {});
});

router.get('/last-purchases', function (req, res, next) {
    res.render('lastPurchases', {});
});

module.exports = router;

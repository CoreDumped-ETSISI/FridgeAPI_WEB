'use strict';

const express = require('express');
const router = express.Router();

/* WEB ROUTES */

router.get('/', function (req, res, next) {
    res.render('store', {title: 'Express'});
});

router.get('/store', function (req, res, next) {
    res.render('store', {title: 'Express'});
});

router.get('/purchase-history', function (req, res, next) {
    res.render('purchase_history', {title: 'Express'});
});

router.get('/payment-history', function (req, res, next) {
    res.render('payment_history', {title: 'Express'});
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Express'});
});

router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Express'});
});

router.get('/verify-email', function (req, res, next) {
    res.render('verifyEmail', {title: 'Express'});
});

router.get('/forgot-password', function (req, res, next) {
    res.render('forgotPassword', {title: 'Express'});
});

router.get('/reset-password', function (req, res, next) {
    res.render('resetPassword', {title: 'Express'});
});

module.exports = router;

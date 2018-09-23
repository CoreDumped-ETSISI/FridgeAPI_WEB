'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config');
const auth = require('../middlewares/auth');

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

router.get('/admin/add-new-product', function (req, res, next) {
    res.render('admin_products', {title: 'Express'});
});

router.get('/admin/add-payment', function (req, res, next) {
    res.render('admin_payments', {title: 'Express'});
});

router.get('/admin/add-stock', function (req, res, next) {
    res.render('admin_stock', {title: 'Express'});
});

router.get('/admin/user-list', function (req, res, next) {
    res.render('admin_user_list', {title: 'Express'});
});

router.get('/admin', function (req, res, next) {
    res.render('admin', {title: 'Express'});
});

module.exports = router;

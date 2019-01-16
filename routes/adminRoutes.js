'use strict';

const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

/* ADMIN ROUTES */

router.get('/', auth, admin, function (req, res, next) {
    res.render('admin/admin', {title: 'Express'});
});

/* PRODUCTS */

router.get('/add-new-product', auth, admin, function (req, res, next) {
    res.render('admin/admin_products', {title: 'Express'});
});

router.get('/update-product', auth, admin, function (req, res, next) {
    res.render('admin/admin_update_product', {title: 'Express'});
});

/* USERS */

router.get('/add-payment', auth, admin, function (req, res, next) {
    res.render('admin/admin_payments', {title: 'Express'});
});

router.get('/user-list', auth, admin, function (req, res, next) {
    res.render('admin/admin_user_list', {title: 'Express'});
});

/* OFFERS */

router.get('/add-new-offer', auth, admin, function (req, res, next) {
    res.render('admin/admin_offer', {title: 'Express'});
});

router.get('/update-offer', auth, admin, function (req, res, next) {
    res.render('admin/admin_update_offer', {title: 'Express'});
});

module.exports = router;
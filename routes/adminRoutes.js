'use strict';

const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

/* ADMIN ROUTES */

router.get('/', auth, admin, function (req, res, next) {
    res.render('admin/admin', {title: 'Express'});
});

router.get('/products', auth, admin, function (req, res, next) {
    res.render('admin/products_menu', {title: 'Express'});
});

router.get('/users', auth, admin, function (req, res, next) {
    res.render('admin/users_menu', {title: 'Express'});
});

router.get('/offers', auth, admin, function (req, res, next) {
    res.render('admin/offers_menu', {title: 'Express'});
});

/* PRODUCTS */

router.get('/products/add-new-product', auth, admin, function (req, res, next) {
    res.render('admin/admin_products', {title: 'Express'});
});

router.get('/products/update-product', auth, admin, function (req, res, next) {
    res.render('admin/admin_update_product', {title: 'Express'});
});

router.get('/products/add-stock', auth, admin, function (req, res, next) {
    res.render('admin/admin_add_stock', {title: 'Express'});
});

/* USERS */

router.get('/users/add-payment', auth, admin, function (req, res, next) {
    res.render('admin/admin_payments', {title: 'Express'});
});

router.get('/users/user-list', auth, admin, function (req, res, next) {
    res.render('admin/admin_user_list', {title: 'Express'});
});

/* OFFERS */

router.get('/offers/add-new-offer', auth, admin, function (req, res, next) {
    res.render('admin/admin_offer', {title: 'Express'});
});

router.get('/offers/update-offer', auth, admin, function (req, res, next) {
    res.render('admin/admin_update_offer', {title: 'Express'});
});

module.exports = router;
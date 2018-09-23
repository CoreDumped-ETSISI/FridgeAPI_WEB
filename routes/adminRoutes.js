'use strict';

const express = require('express');
const router = express.Router();

/* ADMIN ROUTES */

router.get('/', function (req, res, next) {
    res.render('admin/admin', {title: 'Express'});
});

router.get('/add-new-product', function (req, res, next) {
    res.render('admin/admin_products', {title: 'Express'});
});

router.get('/add-payment', function (req, res, next) {
    res.render('admin/admin_payments', {title: 'Express'});
});

router.get('/update-product', function (req, res, next) {
    res.render('admin/admin_update_product', {title: 'Express'});
});

router.get('/user-list', function (req, res, next) {
    res.render('admin/admin_user_list', {title: 'Express'});
});



module.exports = router;
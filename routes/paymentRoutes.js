'use strict';

const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.post('/', auth, admin, paymentCtrl.savePayment);
router.get('/', auth, paymentCtrl.getPaymentList);
router.get('/listAll', auth, admin, paymentCtrl.getPaymentListAll);
router.get('/id/:id', auth, paymentCtrl.getPayment);
router.delete('/id/:id', auth, admin, paymentCtrl.deletePayment);

module.exports = router;

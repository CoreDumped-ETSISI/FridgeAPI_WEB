'use strict';

const express = require('express');
const router = express.Router();
const purchaseCtrl = require('../controllers/purchase');
const verified = require('../middlewares/verified');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.post('/', auth, verified, purchaseCtrl.savePurchase);
router.get('/', auth, purchaseCtrl.getPurchaseList);
router.get('/listAll', auth, admin, purchaseCtrl.getPurchaseListAll);
router.get('/recents', auth, purchaseCtrl.getLastPurchases);
router.get('/id/:id', auth, purchaseCtrl.getPurchase);
router.delete('/id/:id', auth, admin, purchaseCtrl.deletePurchase);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const purchaseCtrl = require('../controllers/purchase');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.post('/', auth, purchaseCtrl.savePurchase);
router.get('/', auth, purchaseCtrl.getPurchaseList);
router.get('/listAll', auth, admin, purchaseCtrl.getPurchaseListAll);
router.get('/recents', purchaseCtrl.getLastPurchases);
router.get('/id/:id', auth, purchaseCtrl.getPurchase);
router.delete('/id/:id', auth, admin, purchaseCtrl.deletePurchase);
router.post('/cooked/:id', purchaseCtrl.setCooked);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const offerCtrl = require('../controllers/offer');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const uploader = require('../middlewares/imageUpload');

router.post('/', auth, admin, uploader.offerImage.single('image'), offerCtrl.saveOffer);
router.get('/', offerCtrl.getOfferList);
router.get('/in-stock', offerCtrl.getAvailableOfferList);
router.get('/:id', offerCtrl.getOffer);
router.patch('/:id', auth, admin, uploader.offerImage.single('image'), offerCtrl.updateOffer);
router.delete('/:id', auth, admin, offerCtrl.deleteOffer);

module.exports = router;

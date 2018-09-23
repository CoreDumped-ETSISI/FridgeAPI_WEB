'use strict';

const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const uploader = require('../middlewares/imageUpload');

router.post('/', auth, admin, uploader.productImage.single('image'), productCtrl.saveProduct);
router.get('/', productCtrl.getProductList);
router.get('/in-stock', productCtrl.getAvailableProductList);
router.get('/:id', productCtrl.getProduct);
router.patch('/:id', auth, admin, uploader.productImage.single('image'), productCtrl.updateProduct);
router.delete('/:id', auth, admin, productCtrl.deleteProduct);

module.exports = router;

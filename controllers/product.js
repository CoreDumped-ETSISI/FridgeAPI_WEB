'use strict';

const services = require('../services');
const input = require('../services/inputValidators');
const Product = require('../models/product');
const config = require('../config');

const path = require('path');
const image = require('../middlewares/imageUpload');

function getProduct(req, res) {
    let productId = req.params.id;
    if (!input.validId(productId)) return res.sendStatus(400);

    Product.findOne({_id: productId})
        .select('-marketPrice')
        .exec((err, product) => {
            if (err) return res.sendStatus(500);
            if (!product) return res.sendStatus(404);
            res.status(200).send(product)
        })
}

function getProductList(req, res) {
    Product.find({})
        .exec((err, products) => {
            if (err) return res.sendStatus(500);
            if (!products) return res.sendStatus(404);
            return res.status(200).send(products)
        })
}

function getAvailableProductList(req, res) {
    Product.find({stock: {$gt: 0}})
        .select('-marketPrice')
        .exec((err, products) => {
            if (err) return res.sendStatus(500);
            if (!products) return res.sendStatus(404);
            return res.status(200).send(products)
        })
}

function updateProduct(req, res) {
    const productId = req.params.id;
    if (!input.validId(productId)) return res.sendStatus(400);

    const name = req.body.name;
    const price = req.body.price;
    const stock = req.body.stock;
    const units = req.body.units;
    const ext = image.obtainExt(req.file);

    if (!name &&
        !price &&
        !units &&
        !stock &&
        !ext)
        return res.sendStatus(400);

    let updatedFields = {};
    if (name) {
        if (!input.validProductName(name)) return res.sendStatus(400);
        updatedFields.name = name;
    }
    if (req.file) updatedFields.image = req.file.filename;

    if (stock) {
        if (!input.validInt(stock)) return res.sendStatus(400);
        updatedFields.stock = stock;
    }

    if (price && units) {
        console.log('Price');
        if (!input.validFloat(price)) return res.sendStatus(400);
        if (!input.validInt(units)) return res.sendStatus(400);
        console.log('Price2');
        updatedFields.marketPrice = price / units;
        updatedFields.price = services.calcPrice(updatedFields.marketPrice);
    }
    Product.findOne({_id: productId})
        .exec((err, product) => {
            if (err) return res.sendStatus(500);
            if (!product || product.length === 0) return res.sendStatus(404);

            let imagePath = null;
            if(ext){
                if(updatedFields.name)
                    imagePath = path.join(config.PRODUCTS_IMAGES_PATH, image.convertToValidName(updatedFields.name) + ext);
                else
                    imagePath = path.join(config.PRODUCTS_IMAGES_PATH, image.convertToValidName(product.name) + ext);
                updatedFields.image = imagePath;
                image.saveToDisk(req.file, imagePath, null);
            }
            product.set(updatedFields);
            product.save((err, productStored) => {
                if (err) return res.sendStatus(500);
                return res.status(200).send(productStored);
            })
        })
}

function saveProduct(req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const stock = req.body.stock;
    const ext = image.obtainExt(req.file);

    if (!input.validProductName(name) ||
        !input.validFloat(price) ||
        !input.validInt(stock))
        return res.sendStatus(400);

    const imagePath = path.join(config.PRODUCTS_IMAGES_PATH, image.convertToValidName(name) + ext);

    Product.findOne({name: name}, (err, productExist) => {
        if (err) return res.sendStatus(500);
        if (productExist) return res.sendStatus(409);

        const marketPrice = price / stock;
        const finalPrice = services.calcPrice(price / stock);

        const product = new Product({
            name: name,
            marketPrice: marketPrice,
            price: finalPrice,
            image: imagePath,
            stock: stock
        });

        product.save((err, productStored) => {
            if (err) return res.sendStatus(500);

            image.saveToDisk(req.file, imagePath, null);
            return res.status(200).send(productStored)
        })
    })
}

function deleteProduct(req, res) {
    const productId = req.params.id;
    if (!input.validId(productId)) return res.sendStatus(400);

    Product.remove({_id: productId})
        .exec((err, product) => {
            if (err) return res.sendStatus(500);
            if (!product) return res.sendStatus(404);
            return res.sendStatus(200)
        })
}

module.exports = {
    getProduct,
    getProductList,
    getAvailableProductList,
    updateProduct,
    saveProduct,
    deleteProduct
};

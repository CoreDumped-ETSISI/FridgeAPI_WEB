'use strict';

const services = require('../services');
const input = require('../services/inputValidators');
const Product = require('../models/product');
const config = require('../config');

const path = require('path');
const image = require('../middlewares/imageUpload');
const rtn = require("../middlewares/apiResults");

function getProduct(req, res) {
    let productId = req.params.id;
    if (!input.validId(productId)) return rtn.status(res, 400);

    Product.findOne({_id: productId})
        .select('-marketPrice')
        .exec((err, product) => {
            if (err) return rtn.intrServErr(res);
            if (!product) return rtn.notFound(res, dict.objs.product);
            rtn.obj(res, 200, product)
        })
}

function getProductList(req, res) {
    Product.find({})
        .exec((err, products) => {
            if (err) return rtn.intrServErr(res);
            if (!products) return rtn.notFound(res, dict.objs.product);
            return rtn.obj(res, 200, products)
        })
}

function getAvailableProductList(req, res) {
    Product.find({stock: {$gt: 0}})
        .select('-marketPrice')
        .exec((err, products) => {
            if (err) return rtn.intrServErr(res);
            if (!products) return rtn.notFound(res, dict.objs.product);
            return rtn.obj(res, 200, products)
        })
}

function updateProduct(req, res) {
    const productId = req.params.id;
    if (!input.validId(productId)) return rtn.status(res, 400);

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
        return rtn.status(res, 400);

    let updatedFields = {};
    if (name) {
        if (!input.validProductName(name)) return rtn.status(res, 400);
        updatedFields.name = name;
    }

    if (stock) {
        if (!input.validInt(stock)) return rtn.status(res, 400);
        updatedFields.stock = stock;
    }

    if (price && units) {
        if (!input.validFloat(price)) return rtn.status(res, 400);
        if (!input.validInt(units)) return rtn.status(res, 400);
        updatedFields.marketPrice = price / units;
        updatedFields.price = services.calcPrice(updatedFields.marketPrice);
    }
    Product.findOne({_id: productId})
        .exec((err, product) => {
            if (err) return rtn.intrServErr(res);
            if (!product || product.length === 0) return rtn.notFound(res, dict.objs.product);

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
                if (err) return rtn.intrServErr(res);
                return rtn.obj(res, 200, productStored);
            })
        })
}

function addStock(req, res) {
    const productId = req.params.id;
    if (!input.validId(productId)) return rtn.status(res, 400);

    const stock = req.body.stock;

    if (!stock)
        return rtn.status(res, 400);

    let updatedFields = {};

    if (stock) {
        if (!input.validInt(stock)) return rtn.status(res, 400);
    }

    Product.findOne({_id: productId})
        .exec((err, product) => {
            if (err) return rtn.intrServErr(res);
            if (!product || product.length === 0) return rtn.notFound(res, dict.objs.product);

            updatedFields.stock = (parseInt(product.stock) + parseInt(stock)).toString();

            product.set(updatedFields);
            product.save((err, productStored) => {
                if (err) return rtn.intrServErr(res);
                return rtn.obj(res, 200, productStored);
            })
        })
}

function saveProduct(req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const stock = req.body.stock;
    const ext = image.obtainExt(req.file);
    let imagePath = null;

    if (!input.validProductName(name) ||
        !input.validFloat(price) ||
        !input.validInt(stock))
        return rtn.status(res, 400);

    Product.findOne({name: name}, (err, productExist) => {
        if (err) return rtn.intrServErr(res);
        if (productExist) return rtn.status(res, 409);

        const marketPrice = price / stock;
        const finalPrice = services.calcPrice(price / stock);
        if(ext) imagePath = path.join(config.PRODUCTS_IMAGES_PATH, image.convertToValidName(name) + ext);
        else imagePath = config.DEFAULT_PRODUCT_IMAGE;

        const product = new Product({
            name: name,
            marketPrice: marketPrice,
            price: finalPrice,
            image: imagePath,
            stock: stock
        });

        product.save((err, productStored) => {
            if (err) return rtn.intrServErr(res);
            if(ext) image.saveToDisk(req.file, imagePath, null);
            return rtn.obj(res, 200, productStored)
        })
    })
}

function deleteProduct(req, res) {
    const productId = req.params.id;
    if (!input.validId(productId)) return rtn.status(res, 400);

    Product.remove({_id: productId})
        .exec((err, product) => {
            if (err) return rtn.intrServErr(res);
            if (!product) return rtn.notFound(res, dict.objs.product);
            return rtn.status(res, 200)
        })
}

module.exports = {
    getProduct,
    getProductList,
    getAvailableProductList,
    updateProduct,
    saveProduct,
    deleteProduct,
    addStock
};

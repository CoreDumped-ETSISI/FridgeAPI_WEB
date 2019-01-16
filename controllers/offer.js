'use strict';

const services = require('../services');
const input = require('../services/inputValidators');
const Offer = require('../models/offer');
const config = require('../config');

const path = require('path');
const image = require('../middlewares/imageUpload');

function getOffer(req, res) {
    let offerId = req.params.id;
    if (!input.validId(offerId)) return res.sendStatus(400);

    Offer.findOne({_id: offerId})
        .exec((err, offer) => {
            if (err) return res.sendStatus(500);
            if (!offer) return res.sendStatus(404);
            res.status(200).send(offer)
        })
}

function getOfferList(req, res) {
    Offer.find()
        .populate(path = "products", model = "product")
        .exec((err, offers) => {
            if (err) return res.sendStatus(500);
            if (!offers) return res.sendStatus(404);
            return res.status(200).send(offers)
        })
}

function getAvailableOfferList(req, res) {//TODO: NOT finished
    Offer.find()
        .populate(path = "products", model = "product")
        .exec((err, offers) => {
            if (err) return res.sendStatus(500);
            if (!offers) return res.sendStatus(404);
            return res.status(200).send(offers)
        })
}

function updateOffer(req, res) {
    const offerId = req.params.id;
    if (!input.validId(offerId)) return res.sendStatus(400);

    const name = req.body.name;
    const price = req.body.price;
    const products = req.body.products;
    const ext = image.obtainExt(req.file);

    if (!name &&
        !price &&
        !ext)
        return res.sendStatus(400);

    let updatedFields = {};
    if (name) {
        if (!input.validProductName(name)) return res.sendStatus(400);
        updatedFields.name = name;
    }

    if (products) {
        if (typeof products === 'undefined' || products.length < 0) return res.sendStatus(400);
        updatedFields.products = products;
    }

    if (price) {
        if (!input.validFloat(price)) return res.sendStatus(400);
        updatedFields.price = price;
    }
    Offer.findOne({_id: offerId})
        .exec((err, offer) => {
            if (err) return res.sendStatus(500);
            if (!offer || offer.length === 0) return res.sendStatus(404);

            let imagePath = null;
            if(ext){
                if(updatedFields.name)
                    imagePath = path.join(config.OFFERS_IMAGES_PATH, image.convertToValidName(updatedFields.name) + ext);
                else
                    imagePath = path.join(config.OFFERS_IMAGES_PATH, image.convertToValidName(offer.name) + ext);
                updatedFields.image = imagePath;
                image.saveToDisk(req.file, imagePath, null);
            }
            offer.set(updatedFields);
            offer.save((err, offerStored) => {
                if (err) return res.sendStatus(500);
                return res.status(200).send(offerStored);
            })
        })
}

function saveOffer(req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const products = req.body.products;
    const ext = image.obtainExt(req.file);
    let imagePath = null;

    if (!input.validOfferName(name) ||
        !input.validFloat(price))
        return res.sendStatus(400);

    if (products) {
        if (typeof products === 'undefined' || products.length < 0) return res.sendStatus(400);
        updatedFields.products = products;
    }

      Offer.findOne({name: name}, (err, offerExist) => {
        if (err) return res.sendStatus(500);
        if (offerExist) return res.sendStatus(409);

        if(ext) imagePath = path.join(config.OFFERS_IMAGES_PATH, image.convertToValidName(name) + ext);
        else imagePath = config.DEFAULT_PRODUCT_IMAGE;

        const offer = new Offer({
            name: name,
            price: price,
            image: imagePath,
            stock: stock
        });

        offer.save((err, offerStored) => {
            if (err) return res.sendStatus(500);
            if(ext) image.saveToDisk(req.file, imagePath, null);
            return res.status(200).send(offerStored)
        })
    })
}

function deleteOffer(req, res) {
    const offerId = req.params.id;
    if (!input.validId(offerId)) return res.sendStatus(400);

    Offer.remove({_id: offerId})
        .exec((err, offer) => {
            if (err) return res.sendStatus(500);
            if (!offer) return res.sendStatus(404);
            return res.sendStatus(200)
        })
}

module.exports = {
    getOffer,
    getOfferList,
    getAvailableOfferList,
    updateOffer,
    saveOffer,
    deleteOffer
};

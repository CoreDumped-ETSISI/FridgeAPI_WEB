"use strict";

const services = require("../services");
const input = require("../services/inputValidators");
const Offer = require("../models/offer");
const Product = require("../models/product");
const config = require("../config");

const path = require("path");
const image = require("../middlewares/imageUpload");

function getOffer(req, res) {
  let offerId = req.params.id;
  if (!input.validId(offerId)) return res.sendStatus(400);

  Offer.findOne({ _id: offerId }).exec((err, offer) => {
    if (err) return res.sendStatus(500);
    if (!offer) return res.sendStatus(404);
    res.status(200).send(offer);
  });
}

function getOfferList(req, res) {
  Offer.find()
    .populate({
      path: "products.product",
      populate: {
        path: "product",
        model: "Product"
      }
    })
    .exec((err, offers) => {
      if (err) return res.sendStatus(500);
      if (!offers) return res.sendStatus(404);
      return res.status(200).send(offers);
    });
}

function getAvailableOfferList(req, res) {
  //TODO: check products
  Offer.find()
    .populate({
      path: "products.product",
      populate: {
        path: "product",
        model: "Product"
      }
    })
    .exec((err, offers) => {
      if (err) return res.sendStatus(500);
      if (!offers) return res.sendStatus(404);
      return res.status(200).send(offers);
    });
}

function updateOffer(req, res) {
  const offerId = req.params.id;
  if (!input.validId(offerId)) return res.sendStatus(400);

  const name = req.body.name;
  const price = req.body.price;
  const ext = image.obtainExt(req.file);

  if (!req.body.products) return res.sendStatus(400);
  const idList = req.body.products.split(",");

  if (!name && !price && !ext && !idList) {
    console.log("not all fileds in body");
    return res.sendStatus(400);
  }

  let updatedFields = {};
  if (name) {
    if (!input.validProductName(name)) {
      console.log("not valid name");
      return res.sendStatus(400);
    }
    updatedFields.name = name;
  }

  if (price) {
    if (!input.validFloat(price)) {
      console.log("not valid price");
      return res.sendStatus(400);
    }
    updatedFields.price = price;
  }

  Product.find({ _id: { $in: idList } }).exec(function(err, products) {
    if (err) return res.sendStatus(500);
    if (!products || products.length === 0) return res.sendStatus(404);
    let productList = [];
    for (let x = 0; x < products.length; x++) {
      let count = services.countOccurrences(products[x]._id, idList);
      productList.push({ product: products[x]._id, quantity: count });

      if(x === products.length-1){
        updatedFields.products = productList;
      }
    }

    Offer.findOne({ _id: offerId }).exec((err, offer) => {
      if (err) {
        console.log(`Error: ${err}`);
        return res.sendStatus(500);
      }
      if (!offer || offer.length === 0) {
        console.log(`Offer not founded: ${offerId}`);
        return res.sendStatus(404);
      }

      console.log(`Offer founded: ${offerId}`);
      let imagePath = null;
      if (ext) {
        console.log(`hay imagen`);
        if (updatedFields.name)
          imagePath = path.join(
            config.OFFERS_IMAGES_PATH,
            image.convertToValidName(updatedFields.name) + ext
          );
        else
          imagePath = path.join(
            config.OFFERS_IMAGES_PATH,
            image.convertToValidName(offer.name) + ext
          );
        updatedFields.image = imagePath;
        image.saveToDisk(req.file, imagePath, null);
        console.log(`Saved image`);
      }
      offer.set(updatedFields);
      offer.save((err, offerStored) => {
        if (err) {
          console.log(`Offer not stored. Error: ${err}`);
          return res.sendStatus(500);
        }
        console.log(`Offer stored: ${offerStored}`);
        return res.status(200).send(offerStored);
      });
    });
  });
}

function saveOffer(req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const ext = image.obtainExt(req.file);
  let imagePath = null;

  if (!req.body.products) return res.sendStatus(400);
  const idList = req.body.products.split(",");

  if (!input.validProductName(name) || !input.validFloat(price))
    return res.sendStatus(400);

  Product.find({ _id: { $in: idList } }).exec(function(err, products) {
    if (err) return res.sendStatus(500);
    if (!products || products.length === 0) return res.sendStatus(404);
    let productList = [];
    for (let x = 0; x < products.length; x++) {
      let count = services.countOccurrences(products[x]._id, idList);
      productList.push({ product: products[x]._id, quantity: count });
    }

    Offer.findOne({ name: name }, (err, offerExist) => {
      if (err) return res.sendStatus(500);
      if (offerExist) return res.sendStatus(409);

      if (ext)
        imagePath = path.join(
          config.OFFERS_IMAGES_PATH,
          image.convertToValidName(name) + ext
        );
      else imagePath = config.DEFAULT_PRODUCT_IMAGE;

      const offer = new Offer({
        name: name,
        price: price,
        image: imagePath,
        products: productList
      });
      offer.save((err, offerStored) => {
        if (err) return res.sendStatus(500);
        if (ext) image.saveToDisk(req.file, imagePath, null);
        return res.status(200).send(offerStored);
      });
    });
  });
}

function deleteOffer(req, res) {
  const offerId = req.params.id;
  if (!input.validId(offerId)) return res.sendStatus(400);

  Offer.remove({ _id: offerId }).exec((err, offer) => {
    if (err) return res.sendStatus(500);
    if (!offer) return res.sendStatus(404);
    return res.sendStatus(200);
  });
}

module.exports = {
  getOffer,
  getOfferList,
  getAvailableOfferList,
  updateOffer,
  saveOffer,
  deleteOffer
};

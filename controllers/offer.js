"use strict";

const services = require("../services");
const input = require("../services/inputValidators");
const Offer = require("../models/offer");
const Product = require("../models/product");
const config = require("../config");

const path = require("path");
const image = require("../middlewares/imageUpload");
const rtn = require("../middlewares/apiResults");

const dict = require('../middlewares/dictionary');

const populateOfferProds = {
  path: "products.product",
  populate: {
    path: "product",
    model: "Product"
  }
};

function getOffer(req, res) {
  let offerId = req.params.id;
  if (!input.validId(offerId)) return rtn.status(res, 400);

  Offer.findOne({ _id: offerId })
    .populate(populateOfferProds)
    .exec((err, offer) => {
    if (err) return rtn.intrServErr(res);
    if (!offer) return rtn.notFound(res, dict.objs.offer);
    rtn.obj(res, 200, offer);
  });
}

function getOfferList(req, res) {
  Offer.find()
    .populate(populateOfferProds)
    .exec((err, offers) => {
      if (err) return rtn.intrServErr(res);
      if (!offers) return rtn.notFound(res, dict.objs.offer);
      return rtn.obj(res, 200, offers);
    });
}

function getAvailableOfferList(req, res) {
  //TODO: check products
  Offer.find()
    .populate(populateOfferProds)
    .exec((err, offers) => {
      if (err) return rtn.intrServErr(res);
      if (!offers) return rtn.notFound(res, dict.objs.offer);

      let availableOffers = [];

      calculateOfferListAvailavility(offers).then(response => {
        for (let i = 0; i < response.length; i++) {
          if (response[i].haveStock) {
            offers[i].stock = response[i].stock;
            availableOffers.push(offers[i]);
          }

          if (i === response.length - 1) {
            return rtn.obj(res, 200, availableOffers);
          }
        }
      });
    });
}

function calculateOfferListAvailavility(offers) {
  let promiseList = [];

  for (let i = 0; i < offers.length; i++) {
    promiseList.push(calculateOfferAvailavility(offers[i]));
  }

  return Promise.all(promiseList);
}

function calculateOfferAvailavility(offer) {
  return new Promise((resolve, reject) => {
    let promiseList = [];
    let minStock = 0;

    for (let x = 0; x < offer.products.length; x++) {
      promiseList.push(calculateAvailableStock(offer.products[x]));
    }

    Promise.all(promiseList).then(response => {
      for (let i = 0; i < response.length; i++) {
        if (response[i].haveStock) {
          if (minStock === 0 || response[i].stock < minStock) {
            minStock = response[i].stock;
          }

          if (i === offer.products.length - 1) {
            resolve({ stock: minStock, haveStock: true });
          }
        } else {
          resolve({ haveStock: false });
        }
      }
    });
  });
}

function calculateAvailableStock(offerItem) {
  return new Promise((resolve, reject) => {
    let divStock = offerItem.product.stock / offerItem.quantity;
    let countStock = divStock - (divStock % 1);

    if (countStock < 1) {
      resolve({ haveStock: false });
    } else {
      resolve({ stock: countStock, haveStock: true });
    }
  });
}

function updateOffer(req, res) {
  const offerId = req.params.id;
  if (!input.validId(offerId)) return rtn.status(res, 400);

  const name = req.body.name;
  const price = req.body.price;
  const ext = image.obtainExt(req.file);

  if (!req.body.products) return rtn.msgBadReq(res, dict.errMsgs.productsRequired);
  const idList = req.body.products.split(",");

  if (!name && !price && !ext && !idList) return rtn.msgBadReq(res, dict.errMsgs.dataRequired);

  let updatedFields = {};
  if (name) {
    if (!input.validProductName(name)) return rtn.msgNotValid(res, 400, dict.items.productName);
    updatedFields.name = name;
  }

  if (price) {
    if (!input.validFloat(price)) return rtn.msgNotValid(res, 400, dict.items.price);
    updatedFields.price = price;
  }

  Product.find({ _id: { $in: idList } }).exec(function(err, products) {
    if (err) return rtn.intrServErr(res);
    if (!products || products.length === 0) return rtn.notFound(res, dict.objs.product);
    let productList = [];
    for (let x = 0; x < products.length; x++) {
      let count = services.countOccurrences(products[x]._id, idList);
      productList.push({ product: products[x]._id, quantity: count });

      if (x === products.length - 1) {
        updatedFields.products = productList;
      }
    }

    Offer.findOne({ _id: offerId }).exec((err, offer) => {
      if (err) return rtn.intrServErr(res);

      if (!offer || offer.length === 0) return rtn.notFound(res, dict.objs.offer);

      let imagePath = null;
      if (ext) {
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
      }
      offer.set(updatedFields);
      offer.save((err, offerStored) => {
        if (err) return rtn.intrServErr(res);
        if(!offerStored) return rtn.notFound(res, dict.objs.offer)

        return rtn.obj(res, 200, offerStored);
      });
    });
  });
}

function saveOffer(req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const ext = image.obtainExt(req.file);
  let imagePath = null;

  if (!req.body.products) return rtn.status(res, 400);
  const idList = req.body.products.split(",");

  if (!input.validProductName(name) || !input.validFloat(price))
    return rtn.msgNotValid(res, 400, dict.items.nameOrPrice);

  Product.find({ _id: { $in: idList } }).exec(function(err, products) {
    if (err) return rtn.intrServErr(res);
    if (!products || products.length === 0) return rtn.notFound(res, dsit.objs.product);
    let productList = [];
    for (let x = 0; x < products.length; x++) {
      let count = services.countOccurrences(products[x]._id, idList);
      productList.push({ product: products[x]._id, quantity: count });
    }

    Offer.findOne({ name: name }, (err, offerExist) => {
      if (err) return rtn.intrServErr(res);
      if (offerExist) return rtn.status(res, 409);

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
        if (err) return rtn.intrServErr(res);
        if (ext) image.saveToDisk(req.file, imagePath, null);
        return rtn.obj(res, 200, offerStored);
      });
    });
  });
}

function deleteOffer(req, res) {
  const offerId = req.params.id;
  if (!input.validId(offerId)) return rtn.status(res, 400);

  Offer.remove({ _id: offerId }).exec((err, offer) => {
    if (err) return rtn.intrServErr(res);
    if (!offer) return rtn.notFound(res, dict.objs.offer);
    return rtn.success(res, dict.msg200.offerDeleted);
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

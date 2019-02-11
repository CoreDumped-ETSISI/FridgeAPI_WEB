"use strict";

const services = require("../services");
const input = require("../services/inputValidators");
const Purchase = require("../models/purchase");
const Product = require("../models/product");
const Offer = require("../models/offer");
const User = require("../models/user");

function getPurchase(req, res) {
  let purchaseId = req.params.id;
  if (!input.validId(purchaseId)) return res.sendStatus(400);

  Purchase.findOne({ _id: purchaseId, userId: req.user })
    .select("-userId") //TODO: Overwrite function toJSON to avoid this
    .exec((err, purchase) => {
      if (err) return res.sendStatus(500);
      if (!purchase) return res.sendStatus(404);
      return res.status(200).send(purchase);
    });
}

function getPurchaseList(req, res) {
  Purchase.find({ userId: req.user })
    .select("-userId")
    .sort({ timestamp: -1 })
    .exec((err, purchases) => {
      if (err) return res.sendStatus(500);
      if (!purchases || purchases.length === 0) return res.sendStatus(404);
      return res.status(200).send(purchases);
    });
}

function getPurchaseListAll(req, res) {
  Purchase.find({}, (err, purchases) => {
    if (err) return res.sendStatus(500);
    if (!purchases || purchases.length === 0) return res.sendStatus(404);
    return res.status(200).send(purchases);
  });
}

function savePurchase(req, res) {
  if (!req.body.productList && !req.body.offerList) return res.sendStatus(400);
  let idList = req.body.productList.split(",");
  let offersList = req.body.offerList.split(",");

  Offer.find({ _id: { $in: offersList } })
  .populate({
    path: "products.product",
    populate: {
      path: "product",
      model: "Product"
    }
  }).exec(function(err, offers) {
    if (offersList.length < 1 && err) return res.sendStatus(500);

    productIdListGenerator(offers, offersList, req.body.productList).then(response => {
      let productIdList = response.split(",");

      Product.find({ _id: { $in: productIdList } }).exec(function(err, products) {
        if (productIdList.length < 1 && err) return res.sendStatus(500);
        if ( (!products || products.length === 0) && (!offers || offers.length === 0) ) return res.sendStatus(404);
        let amount = 0;
        let productList = [];
        let offerList = [];
        if(offers){
          for (let x = 0; x < offers.length; x++) {
            let count = services.countOccurrences(offers[x]._id, offersList);
            amount += offers[x].price * count; 
            offerList.push({ offer: offers[x], quantity: count });
          }
        }
        if(products){
          for (let x = 0; x < products.length; x++) {
            let count = services.countOccurrences(products[x]._id, idList);
            if(count > 0){
              if (count > products[x].stock) {
                return res.sendStatus(400);
              }
              amount += products[x].price * count;
              productList.push({ product: products[x], quantity: count });
            }
          }
        }
        if (amount < 0.01) return res.sendStatus(400);
        const purchase = new Purchase({
          userId: req.user,
          amount: amount,
          productList: productList,
          offerList: offerList
        });

        User.findOne({ _id: req.user }).exec((err, user) => {
          if (err) return res.sendStatus(500);
          if (!user) return res.sendStatus(404);

          purchase.save((err, purchaseStored) => {
            if (err) return res.sendStatus(500);
            user.updateOne({ $inc: { balance: amount } }, (err, userStored) => {
              if (err) return res.sendStatus(500);

              for (let x = 0; x < products.length; x++) {
                const count = services.countOccurrences(products[x]._id, productIdList);
                products[x].updateOne(
                  { $inc: { stock: -count } },
                  (err, userStored) => {}
                );
              }
              return res.status(200).send(purchaseStored);
            });
          });
        });
      });
    })
  });
}

function productIdListGenerator(offers, offerList, productList){
  return new Promise((resolve, reject) => {
    if(offers && offers.length > 0){
      let list = productList;

      for (let i = 0; i < offers.length; i++){
        let count = services.countOccurrences(offers[i]._id, offerList);
        for (let j = 0; j < count; j++){
          for (let x = 0; x < offers[i].products.length; x++){
            for (let y = 0; y < offers[i].products[x].quantity; y++){
              if(list === ""){
                list = `${offers[i].products[x].product._id}`
              } else {
                list = `${list},${offers[i].products[x].product._id}`
              }
            }
          }
        }

        if(i === offers.length-1){
          resolve(list);
        }
      }
    } else {
      resolve(productList);
    }
  });
}

function getLastPurchases(req, res) {
  Purchase.find({cooked: 0})
    .limit(10)
    .populate("userId")
    .exec(function(err, purchases) {
      if (err) return res.sendStatus(500);
      let finalPurchases = purchases.map(purchase => {
        purchase.userId.email = undefined;
        purchase.userId.balance = undefined;
        purchase.userId.status = undefined;
        purchase.userId.signUpDate = undefined;
        return purchase;
      });
      return res.status(200).send(finalPurchases);
    });
}

function deletePurchase(req, res) {
  const purchaseId = req.params.id;
  if (!input.validId(purchaseId)) return res.sendStatus(400);

  Purchase.findOne({ _id: purchaseId }, "+userId").exec((err, purchase) => {
    if (err) return res.sendStatus(500);
    if (!purchase) return res.sendStatus(404);

    User.findOneAndUpdate(
      { _id: purchase.userId },
      { $inc: { balance: -purchase.amount } }
    ).exec((err, user) => {
      if (err) return res.sendStatus(500);
      purchase.remove();
      return res.sendStatus(200);
    });
  });
}

function setCooked(req, res){
  const purchaseId = req.params.id;
  if (!input.validId(purchaseId)) return res.sendStatus(400);

  Purchase.findOne({ _id: purchaseId }).exec((err, purchase) => {
    if (err) return res.sendStatus(500);
    if (!purchase) return res.sendStatus(404);

    purchase.cooked = true;
    purchase.save((err, purchaseStored) => {
      if (err) return res.sendStatus(500);
      return res.sendStatus(200);
    })
  });
}

module.exports = {
  getPurchase,
  getPurchaseList,
  getPurchaseListAll,
  getLastPurchases,
  savePurchase,
  deletePurchase,
  setCooked
};
